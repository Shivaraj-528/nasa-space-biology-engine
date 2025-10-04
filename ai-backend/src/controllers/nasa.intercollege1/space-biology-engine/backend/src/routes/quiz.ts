import express from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { OpenRouterService } from '../services/openrouter';
import prisma from '../config/database';

const router = express.Router();
const openRouterService = new OpenRouterService();

// @route   POST /api/quiz/generate
// @desc    Generate quiz from publication
// @access  Private (Teachers, Researchers, Scientists)
router.post('/generate', 
  authenticate, 
  authorize('TEACHER', 'RESEARCHER', 'SCIENTIST'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { publicationId, difficulty = 'INTERMEDIATE', questionCount = 5, title, description } = req.body;

      if (!publicationId) {
        return res.status(400).json({
          success: false,
          message: 'Publication ID is required'
        });
      }

      // Get publication content
      const publication = await prisma.publication.findUnique({
        where: { id: publicationId },
        select: {
          title: true,
          abstract: true,
          summary: true,
          keyFindings: true,
          methodology: true
        }
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: 'Publication not found'
        });
      }

      // Prepare content for quiz generation
      const content = [
        publication.title,
        publication.abstract,
        publication.summary,
        publication.methodology,
        ...(publication.keyFindings || [])
      ].filter(Boolean).join('\n\n');

      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient content to generate quiz'
        });
      }

      // Generate quiz questions using AI
      const questions = await openRouterService.generateQuiz(
        content,
        difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        questionCount
      );

      if (questions.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate quiz questions'
        });
      }

      // Create quiz in database
      const quiz = await prisma.quiz.create({
        data: {
          title: title || `Quiz: ${publication.title}`,
          description: description || `Auto-generated quiz from "${publication.title}"`,
          difficulty: difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
          publicationId,
          createdById: req.user!.id,
          isPublic: req.user!.role === 'TEACHER' || req.user!.role === 'SCIENTIST'
        }
      });

      // Create quiz questions
      const questionData = questions.map((q, index) => ({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: index + 1
      }));

      await prisma.quizQuestion.createMany({
        data: questionData
      });

      // Fetch complete quiz with questions
      const completeQuiz = await prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            orderBy: { order: 'asc' }
          },
          publication: {
            select: {
              title: true,
              authors: true
            }
          },
          createdBy: {
            select: {
              name: true,
              role: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: completeQuiz,
        message: 'Quiz generated successfully'
      });
    } catch (error) {
      console.error('Generate quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate quiz'
      });
    }
  }
);

// @route   GET /api/quiz
// @desc    Get quizzes with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      difficulty,
      publicationId,
      createdBy,
      isPublic = true
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      isPublic: isPublic === 'true'
    };

    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    if (publicationId) {
      where.publicationId = publicationId as string;
    }

    if (createdBy) {
      where.createdById = createdBy as string;
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          publication: {
            select: {
              title: true,
              authors: true
            }
          },
          createdBy: {
            select: {
              name: true,
              role: true,
              institution: true
            }
          },
          _count: {
            select: {
              questions: true,
              attempts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      prisma.quiz.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: offset + limitNum < total
        }
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes'
    });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get single quiz with questions
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // Don't include correctAnswer and explanation for security
          }
        },
        publication: {
          select: {
            title: true,
            authors: true,
            abstract: true
          }
        },
        createdBy: {
          select: {
            name: true,
            role: true,
            institution: true
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz'
    });
  }
});

// @route   POST /api/quiz/:id/attempt
// @desc    Submit quiz attempt
// @access  Private
router.post('/:id/attempt', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const answerData: any[] = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      answerData.push({
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        timeSpent: 0 // Could be enhanced to track per-question time
      });
    });

    const score = (correctAnswers / quiz.questions.length) * 100;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        userId: req.user!.id,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeSpent: timeSpent || null
      }
    });

    // Create individual answers
    const answersWithAttemptId = answerData.map(answer => ({
      ...answer,
      attemptId: attempt.id
    }));

    await prisma.quizAnswer.createMany({
      data: answersWithAttemptId
    });

    // Get detailed results
    const detailedAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        answers: {
          include: {
            question: {
              select: {
                question: true,
                options: true,
                correctAnswer: true,
                explanation: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: detailedAttempt,
      message: `Quiz completed! Score: ${score.toFixed(1)}%`
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz attempt'
    });
  }
});

// @route   GET /api/quiz/:id/attempts
// @desc    Get quiz attempts (for quiz creator)
// @access  Private
router.get('/:id/attempts', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user is the quiz creator or has appropriate role
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        createdById: true
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const canViewAttempts = quiz.createdById === req.user!.id || 
                           req.user!.role === 'SCIENTIST' ||
                           req.user!.role === 'TEACHER';

    if (!canViewAttempts) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view quiz attempts'
      });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: id },
      include: {
        user: {
          select: {
            name: true,
            role: true,
            institution: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0 ? 
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts : 0;
    const highestScore = totalAttempts > 0 ? 
      Math.max(...attempts.map(a => a.score)) : 0;

    res.json({
      success: true,
      data: {
        attempts,
        statistics: {
          totalAttempts,
          averageScore: Math.round(averageScore * 100) / 100,
          highestScore
        }
      }
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz attempts'
    });
  }
});

// @route   GET /api/quiz/my/attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get('/my/attempts', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId: req.user!.id },
        include: {
          quiz: {
            select: {
              title: true,
              difficulty: true,
              publication: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      prisma.quizAttempt.count({
        where: { userId: req.user!.id }
      })
    ]);

    // Calculate user statistics
    const averageScore = attempts.length > 0 ? 
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length : 0;
    const bestScore = attempts.length > 0 ? 
      Math.max(...attempts.map(a => a.score)) : 0;

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: offset + limitNum < total
        },
        statistics: {
          totalAttempts: total,
          averageScore: Math.round(averageScore * 100) / 100,
          bestScore
        }
      }
    });
  } catch (error) {
    console.error('Get user quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz attempts'
    });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete quiz
// @access  Private (Creator or Scientists only)
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        createdById: true
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check permissions
    const canDelete = quiz.createdById === req.user!.id || 
                     req.user!.role === 'SCIENTIST';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await prisma.quiz.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
});

export default router;
