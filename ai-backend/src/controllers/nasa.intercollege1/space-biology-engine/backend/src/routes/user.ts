import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get user stats
    const [
      bookmarksCount,
      publicationsCount,
      quizzesCreated,
      quizAttempts,
      chatSessions,
      recentBookmarks,
      recentQuizAttempts
    ] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.publication.count({ where: { uploadedById: userId } }),
      prisma.quiz.count({ where: { createdById: userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.chatSession.count({ where: { userId } }),
      
      // Recent bookmarks
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          publication: {
            select: {
              title: true,
              authors: true,
              source: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent quiz attempts
      prisma.quizAttempt.findMany({
        where: { userId },
        include: {
          quiz: {
            select: {
              title: true,
              difficulty: true
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate average quiz score
    const avgScore = quizAttempts > 0 ? 
      await prisma.quizAttempt.aggregate({
        where: { userId },
        _avg: { score: true }
      }).then(result => result._avg.score || 0) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          bookmarks: bookmarksCount,
          publications: publicationsCount,
          quizzesCreated,
          quizAttempts,
          chatSessions,
          averageQuizScore: Math.round((avgScore || 0) * 100) / 100
        },
        recent: {
          bookmarks: recentBookmarks,
          quizAttempts: recentQuizAttempts
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// @route   GET /api/user/bookmarks
// @desc    Get user bookmarks
// @access  Private
router.get('/bookmarks', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: req.user!.id },
        include: {
          publication: {
            select: {
              id: true,
              title: true,
              abstract: true,
              authors: true,
              keywords: true,
              doi: true,
              publishedAt: true,
              source: true,
              pdfUrl: true,
              summary: true,
              uploadedBy: {
                select: {
                  name: true,
                  institution: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      prisma.bookmark.count({ where: { userId: req.user!.id } })
    ]);

    res.json({
      success: true,
      data: {
        bookmarks,
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
    console.error('Get bookmarks error:', error);
    res.status(500).json({
// @desc    Get user's uploaded publications
// @access  Private
router.get('/publications', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const where: any = { uploadedById: req.user!.id };
    if (status) {
      where.status = status as string;
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          _count: {
            select: {
              bookmarks: true,
              quizzes: true
            }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      prisma.publication.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        publications,
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
    console.error('Get user publications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get publications'
    });
  }
});

// @route   GET /api/user/quizzes
// @desc    Get user's created quizzes
// @access  Private
router.get('/quizzes', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { createdById: req.user!.id },
        include: {
          publication: {
            select: {
              title: true,
              authors: true
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
      prisma.quiz.count({ where: { createdById: req.user!.id } })
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
    console.error('Get user quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes'
    });
  }
});

// @route   GET /api/user/activity
// @desc    Get user activity feed
// @access  Private
router.get('/activity', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    // Get recent activities
    const [recentBookmarks, recentQuizAttempts, recentPublications, recentQuizzes] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: req.user!.id },
        include: {
          publication: {
            select: { title: true, authors: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limitNum / 4)
      }),
      
      prisma.quizAttempt.findMany({
        where: { userId: req.user!.id },
        include: {
          quiz: {
            select: { title: true, difficulty: true }
          }
        },
        orderBy: { completedAt: 'desc' },
        take: Math.ceil(limitNum / 4)
      }),
      
      prisma.publication.findMany({
        where: { uploadedById: req.user!.id },
        select: {
          id: true,
          title: true,
          status: true,
          uploadedAt: true
        },
        orderBy: { uploadedAt: 'desc' },
        take: Math.ceil(limitNum / 4)
      }),
      
      prisma.quiz.findMany({
        where: { createdById: req.user!.id },
        select: {
          id: true,
          title: true,
          difficulty: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limitNum / 4)
      })
    ]);

    // Format activities
    const activities: any[] = [];

    recentBookmarks.forEach(bookmark => {
      activities.push({
        type: 'bookmark',
        action: 'bookmarked',
        target: bookmark.publication.title,
        targetId: bookmark.publicationId,
        timestamp: bookmark.createdAt,
        metadata: {
          authors: bookmark.publication.authors
        }
      });
    });

    recentQuizAttempts.forEach(attempt => {
      activities.push({
        type: 'quiz_attempt',
        action: 'completed quiz',
        target: attempt.quiz.title,
        targetId: attempt.quizId,
        timestamp: attempt.completedAt,
        metadata: {
          score: attempt.score,
          difficulty: attempt.quiz.difficulty
        }
      });
    });

    recentPublications.forEach(publication => {
      activities.push({
        type: 'publication',
        action: 'uploaded',
        target: publication.title,
        targetId: publication.id,
        timestamp: publication.uploadedAt,
        metadata: {
          status: publication.status
        }
      });
    });

    recentQuizzes.forEach(quiz => {
      activities.push({
        type: 'quiz',
        action: 'created quiz',
        target: quiz.title,
        targetId: quiz.id,
        timestamp: quiz.createdAt,
        metadata: {
          difficulty: quiz.difficulty
        }
      });
    });

    // Sort by timestamp and paginate
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        activities: sortedActivities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: activities.length,
          hasMore: offset + limitNum < activities.length
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get detailed user statistics
// @access  Private
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get comprehensive stats
    const [
      totalBookmarks,
      totalPublications,
      totalQuizzes,
      totalQuizAttempts,
      totalChatSessions,
      publicationsByStatus,
      quizzesByDifficulty,
      quizScoreStats,
      monthlyActivity
    ] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.publication.count({ where: { uploadedById: userId } }),
      prisma.quiz.count({ where: { createdById: userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.chatSession.count({ where: { userId } }),
      
      // Publications by status
      prisma.publication.groupBy({
        by: ['status'],
        where: { uploadedById: userId },
        _count: { status: true }
      }),
      
      // Quizzes by difficulty
      prisma.quiz.groupBy({
        by: ['difficulty'],
        where: { createdById: userId },
        _count: { difficulty: true }
      }),
      
      // Quiz score statistics
      prisma.quizAttempt.aggregate({
        where: { userId },
        _avg: { score: true },
        _max: { score: true },
        _min: { score: true }
      }),
      
      // Monthly activity (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count,
          'bookmark' as type
        FROM bookmarks 
        WHERE user_id = ${userId} 
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        
        UNION ALL
        
        SELECT 
          DATE_TRUNC('month', completed_at) as month,
          COUNT(*) as count,
          'quiz_attempt' as type
        FROM quiz_attempts 
        WHERE user_id = ${userId} 
          AND completed_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', completed_at)
        
        ORDER BY month DESC
      `
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalBookmarks,
          totalPublications,
          totalQuizzes,
          totalQuizAttempts,
          totalChatSessions
        },
        publications: {
          byStatus: publicationsByStatus.reduce((acc: any, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {})
        },
        quizzes: {
          byDifficulty: quizzesByDifficulty.reduce((acc: any, item) => {
            acc[item.difficulty] = item._count.difficulty;
            return acc;
          }, {}),
          scoreStats: {
            average: Math.round((quizScoreStats._avg.score || 0) * 100) / 100,
            highest: quizScoreStats._max.score || 0,
            lowest: quizScoreStats._min.score || 0
          }
        },
        activity: {
          monthly: monthlyActivity
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

export default router;
