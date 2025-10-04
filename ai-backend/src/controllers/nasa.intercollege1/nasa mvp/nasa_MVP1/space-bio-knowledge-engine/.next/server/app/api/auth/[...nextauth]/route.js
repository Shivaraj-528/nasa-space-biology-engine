"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yelugodlashivaraj_CascadeProjects_nasa_space_biology_engine_ai_backend_src_controllers_nasa_intercollege1_nasa_mvp_nasa_MVP1_space_bio_knowledge_engine_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/yelugodlashivaraj/CascadeProjects/nasa-space-biology-engine/ai-backend/src/controllers/nasa.intercollege1/nasa mvp/nasa_MVP1/space-bio-knowledge-engine/src/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yelugodlashivaraj_CascadeProjects_nasa_space_biology_engine_ai_backend_src_controllers_nasa_intercollege1_nasa_mvp_nasa_MVP1_space_bio_knowledge_engine_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnllbHVnb2RsYXNoaXZhcmFqJTJGQ2FzY2FkZVByb2plY3RzJTJGbmFzYS1zcGFjZS1iaW9sb2d5LWVuZ2luZSUyRmFpLWJhY2tlbmQlMkZzcmMlMkZjb250cm9sbGVycyUyRm5hc2EuaW50ZXJjb2xsZWdlMSUyRm5hc2ElMjBtdnAlMkZuYXNhX01WUDElMkZzcGFjZS1iaW8ta25vd2xlZGdlLWVuZ2luZSUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZ5ZWx1Z29kbGFzaGl2YXJhaiUyRkNhc2NhZGVQcm9qZWN0cyUyRm5hc2Etc3BhY2UtYmlvbG9neS1lbmdpbmUlMkZhaS1iYWNrZW5kJTJGc3JjJTJGY29udHJvbGxlcnMlMkZuYXNhLmludGVyY29sbGVnZTElMkZuYXNhJTIwbXZwJTJGbmFzYV9NVlAxJTJGc3BhY2UtYmlvLWtub3dsZWRnZS1lbmdpbmUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3NKO0FBQ25PO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BhY2UtYmlvLWtub3dsZWRnZS1lbmdpbmUvPzVlNTAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3llbHVnb2RsYXNoaXZhcmFqL0Nhc2NhZGVQcm9qZWN0cy9uYXNhLXNwYWNlLWJpb2xvZ3ktZW5naW5lL2FpLWJhY2tlbmQvc3JjL2NvbnRyb2xsZXJzL25hc2EuaW50ZXJjb2xsZWdlMS9uYXNhIG12cC9uYXNhX01WUDEvc3BhY2UtYmlvLWtub3dsZWRnZS1lbmdpbmUvc3JjL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy95ZWx1Z29kbGFzaGl2YXJhai9DYXNjYWRlUHJvamVjdHMvbmFzYS1zcGFjZS1iaW9sb2d5LWVuZ2luZS9haS1iYWNrZW5kL3NyYy9jb250cm9sbGVycy9uYXNhLmludGVyY29sbGVnZTEvbmFzYSBtdnAvbmFzYV9NVlAxL3NwYWNlLWJpby1rbm93bGVkZ2UtZW5naW5lL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_mongo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/mongo */ \"(rsc)/./src/lib/mongo.ts\");\n/* harmony import */ var _lib_models_User__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/models/User */ \"(rsc)/./src/lib/models/User.ts\");\n\n\n\n\n\nconst hasGoogle = !!process.env.GOOGLE_OAUTH_CLIENT_ID && !!process.env.GOOGLE_OAUTH_SECRET;\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            name: \"Guest\",\n            credentials: {\n                name: {\n                    label: \"Name\",\n                    type: \"text\"\n                }\n            },\n            async authorize (credentials) {\n                const name = credentials?.name || \"Guest User\";\n                return {\n                    id: `guest-${Date.now()}`,\n                    name,\n                    email: \"guest@example.com\",\n                    role: \"guest\"\n                };\n            }\n        }),\n        ...hasGoogle ? [\n            (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n                clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,\n                clientSecret: process.env.GOOGLE_OAUTH_SECRET\n            })\n        ] : []\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async signIn ({ user, account }) {\n            if (account?.provider === \"google\") {\n                await (0,_lib_mongo__WEBPACK_IMPORTED_MODULE_3__.connectToDatabase)();\n                await _lib_models_User__WEBPACK_IMPORTED_MODULE_4__[\"default\"].updateOne({\n                    email: user.email\n                }, {\n                    $setOnInsert: {\n                        email: user.email,\n                        name: user.name,\n                        role: \"researcher\"\n                    }\n                }, {\n                    upsert: true\n                });\n            }\n            return true;\n        },\n        async jwt ({ token, user }) {\n            if (user && user.role) {\n                token.role = user.role;\n            } else if (!token.role) {\n                token.role = \"student\";\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQWlDO0FBQ3VCO0FBQ0U7QUFDVjtBQUNOO0FBRTFDLE1BQU1LLFlBQVksQ0FBQyxDQUFDQyxRQUFRQyxHQUFHLENBQUNDLHNCQUFzQixJQUFJLENBQUMsQ0FBQ0YsUUFBUUMsR0FBRyxDQUFDRSxtQkFBbUI7QUFFcEYsTUFBTUMsY0FBYztJQUN6QkMsV0FBVztRQUNUVCwyRUFBV0EsQ0FBQztZQUNWVSxNQUFNO1lBQ05DLGFBQWE7Z0JBQUVELE1BQU07b0JBQUVFLE9BQU87b0JBQVFDLE1BQU07Z0JBQU87WUFBRTtZQUNyRCxNQUFNQyxXQUFVSCxXQUFXO2dCQUN6QixNQUFNRCxPQUFPLGFBQXNCQSxRQUFRO2dCQUMzQyxPQUFPO29CQUFFSyxJQUFJLENBQUMsTUFBTSxFQUFFQyxLQUFLQyxHQUFHLEdBQUcsQ0FBQztvQkFBRVA7b0JBQU1RLE9BQU87b0JBQXFCQyxNQUFNO2dCQUFpQjtZQUMvRjtRQUNGO1dBQ0loQixZQUNBO1lBQ0VKLHNFQUFjQSxDQUFDO2dCQUNicUIsVUFBVWhCLFFBQVFDLEdBQUcsQ0FBQ0Msc0JBQXNCO2dCQUM1Q2UsY0FBY2pCLFFBQVFDLEdBQUcsQ0FBQ0UsbUJBQW1CO1lBQy9DO1NBQ0QsR0FDRCxFQUFFO0tBQ1A7SUFDRGUsU0FBUztRQUFFQyxVQUFVO0lBQWU7SUFDcENDLFdBQVc7UUFDVCxNQUFNQyxRQUFPLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFPO1lBQ2pDLElBQUlBLFNBQVNDLGFBQWEsVUFBVTtnQkFDbEMsTUFBTTNCLDZEQUFpQkE7Z0JBQ3ZCLE1BQU1DLHdEQUFTQSxDQUFDMkIsU0FBUyxDQUN2QjtvQkFBRVgsT0FBT1EsS0FBS1IsS0FBSztnQkFBQyxHQUNwQjtvQkFBRVksY0FBYzt3QkFBRVosT0FBT1EsS0FBS1IsS0FBSzt3QkFBRVIsTUFBTWdCLEtBQUtoQixJQUFJO3dCQUFFUyxNQUFNO29CQUFhO2dCQUFFLEdBQzNFO29CQUFFWSxRQUFRO2dCQUFLO1lBRW5CO1lBQ0EsT0FBTztRQUNUO1FBQ0EsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVQLElBQUksRUFBTztZQUM1QixJQUFJQSxRQUFRLEtBQWNQLElBQUksRUFBRTtnQkFDOUJjLE1BQU1kLElBQUksR0FBRyxLQUFjQSxJQUFJO1lBQ2pDLE9BQU8sSUFBSSxDQUFDYyxNQUFNZCxJQUFJLEVBQUU7Z0JBQ3RCYyxNQUFNZCxJQUFJLEdBQUc7WUFDZjtZQUNBLE9BQU9jO1FBQ1Q7UUFDQSxNQUFNWCxTQUFRLEVBQUVBLE9BQU8sRUFBRVcsS0FBSyxFQUFPO1lBQ25DLElBQUlYLFFBQVFJLElBQUksRUFBRTtnQkFDZkosUUFBUUksSUFBSSxDQUFTWCxFQUFFLEdBQUdrQixNQUFNQyxHQUFHO2dCQUNuQ1osUUFBUUksSUFBSSxDQUFTUCxJQUFJLEdBQUdjLE1BQU1kLElBQUk7WUFDekM7WUFDQSxPQUFPRztRQUNUO0lBQ0Y7SUFDQWEsUUFBUS9CLFFBQVFDLEdBQUcsQ0FBQytCLGVBQWU7QUFDckMsRUFBUztBQUVULE1BQU1DLFVBQVV2QyxnREFBUUEsQ0FBQ1U7QUFDa0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcGFjZS1iaW8ta25vd2xlZGdlLWVuZ2luZS8uL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz8wMDk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnO1xuaW1wb3J0IEdvb2dsZVByb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlJztcbmltcG9ydCBDcmVkZW50aWFscyBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzJztcbmltcG9ydCB7IGNvbm5lY3RUb0RhdGFiYXNlIH0gZnJvbSAnQC9saWIvbW9uZ28nO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICdAL2xpYi9tb2RlbHMvVXNlcic7XG5cbmNvbnN0IGhhc0dvb2dsZSA9ICEhcHJvY2Vzcy5lbnYuR09PR0xFX09BVVRIX0NMSUVOVF9JRCAmJiAhIXByb2Nlc3MuZW52LkdPT0dMRV9PQVVUSF9TRUNSRVQ7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9ucyA9IHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHMoe1xuICAgICAgbmFtZTogJ0d1ZXN0JyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7IG5hbWU6IHsgbGFiZWw6ICdOYW1lJywgdHlwZTogJ3RleHQnIH0gfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBjb25zdCBuYW1lID0gKGNyZWRlbnRpYWxzIGFzIGFueSk/Lm5hbWUgfHwgJ0d1ZXN0IFVzZXInO1xuICAgICAgICByZXR1cm4geyBpZDogYGd1ZXN0LSR7RGF0ZS5ub3coKX1gLCBuYW1lLCBlbWFpbDogJ2d1ZXN0QGV4YW1wbGUuY29tJywgcm9sZTogJ2d1ZXN0JyBhcyBjb25zdCB9IGFzIGFueTtcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLi4uKGhhc0dvb2dsZVxuICAgICAgPyBbXG4gICAgICAgICAgR29vZ2xlUHJvdmlkZXIoe1xuICAgICAgICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9PQVVUSF9DTElFTlRfSUQhLFxuICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfT0FVVEhfU0VDUkVUISxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgOiBbXSksXG4gIF0sXG4gIHNlc3Npb246IHsgc3RyYXRlZ3k6ICdqd3QnIGFzIGNvbnN0IH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQgfTogYW55KSB7XG4gICAgICBpZiAoYWNjb3VudD8ucHJvdmlkZXIgPT09ICdnb29nbGUnKSB7XG4gICAgICAgIGF3YWl0IGNvbm5lY3RUb0RhdGFiYXNlKCk7XG4gICAgICAgIGF3YWl0IFVzZXJNb2RlbC51cGRhdGVPbmUoXG4gICAgICAgICAgeyBlbWFpbDogdXNlci5lbWFpbCB9LFxuICAgICAgICAgIHsgJHNldE9uSW5zZXJ0OiB7IGVtYWlsOiB1c2VyLmVtYWlsLCBuYW1lOiB1c2VyLm5hbWUsIHJvbGU6ICdyZXNlYXJjaGVyJyB9IH0sXG4gICAgICAgICAgeyB1cHNlcnQ6IHRydWUgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9OiBhbnkpIHtcbiAgICAgIGlmICh1c2VyICYmICh1c2VyIGFzIGFueSkucm9sZSkge1xuICAgICAgICB0b2tlbi5yb2xlID0gKHVzZXIgYXMgYW55KS5yb2xlO1xuICAgICAgfSBlbHNlIGlmICghdG9rZW4ucm9sZSkge1xuICAgICAgICB0b2tlbi5yb2xlID0gJ3N0dWRlbnQnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH06IGFueSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkuaWQgPSB0b2tlbi5zdWI7XG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5yb2xlID0gdG9rZW4ucm9sZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH0sXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxufSBhcyBhbnk7XG5cbmNvbnN0IGhhbmRsZXIgPSBOZXh0QXV0aChhdXRoT3B0aW9ucyk7XG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJHb29nbGVQcm92aWRlciIsIkNyZWRlbnRpYWxzIiwiY29ubmVjdFRvRGF0YWJhc2UiLCJVc2VyTW9kZWwiLCJoYXNHb29nbGUiLCJwcm9jZXNzIiwiZW52IiwiR09PR0xFX09BVVRIX0NMSUVOVF9JRCIsIkdPT0dMRV9PQVVUSF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImxhYmVsIiwidHlwZSIsImF1dGhvcml6ZSIsImlkIiwiRGF0ZSIsIm5vdyIsImVtYWlsIiwicm9sZSIsImNsaWVudElkIiwiY2xpZW50U2VjcmV0Iiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwiY2FsbGJhY2tzIiwic2lnbkluIiwidXNlciIsImFjY291bnQiLCJwcm92aWRlciIsInVwZGF0ZU9uZSIsIiRzZXRPbkluc2VydCIsInVwc2VydCIsImp3dCIsInRva2VuIiwic3ViIiwic2VjcmV0IiwiTkVYVEFVVEhfU0VDUkVUIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/models/User.ts":
/*!********************************!*\
  !*** ./src/lib/models/User.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst UserSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({\n    name: String,\n    email: {\n        type: String,\n        unique: true,\n        index: true\n    },\n    role: {\n        type: String,\n        enum: [\n            \"guest\",\n            \"student\",\n            \"teacher\",\n            \"researcher\",\n            \"scientist\"\n        ],\n        default: \"student\"\n    }\n}, {\n    timestamps: true\n});\nconst UserModel = mongoose__WEBPACK_IMPORTED_MODULE_0__.models.User || (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)(\"User\", UserSchema);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserModel);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL21vZGVscy9Vc2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFpRDtBQUlqRCxNQUFNRyxhQUFhLElBQUlILDRDQUFNQSxDQUMzQjtJQUNFSSxNQUFNQztJQUNOQyxPQUFPO1FBQUVDLE1BQU1GO1FBQVFHLFFBQVE7UUFBTUMsT0FBTztJQUFLO0lBQ2pEQyxNQUFNO1FBQUVILE1BQU1GO1FBQVFNLE1BQU07WUFBQztZQUFTO1lBQVc7WUFBVztZQUFjO1NBQVk7UUFBRUMsU0FBUztJQUFVO0FBQzdHLEdBQ0E7SUFBRUMsWUFBWTtBQUFLO0FBR3JCLE1BQU1DLFlBQVlaLDRDQUFNQSxDQUFDYSxJQUFJLElBQUlkLCtDQUFLQSxDQUFDLFFBQVFFO0FBQy9DLGlFQUFlVyxTQUFTQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BhY2UtYmlvLWtub3dsZWRnZS1lbmdpbmUvLi9zcmMvbGliL21vZGVscy9Vc2VyLnRzPzZiYjUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCwgbW9kZWxzIH0gZnJvbSAnbW9uZ29vc2UnO1xuXG5leHBvcnQgdHlwZSBVc2VyUm9sZSA9ICdndWVzdCcgfCAnc3R1ZGVudCcgfCAndGVhY2hlcicgfCAncmVzZWFyY2hlcicgfCAnc2NpZW50aXN0JztcblxuY29uc3QgVXNlclNjaGVtYSA9IG5ldyBTY2hlbWEoXG4gIHtcbiAgICBuYW1lOiBTdHJpbmcsXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nLCB1bmlxdWU6IHRydWUsIGluZGV4OiB0cnVlIH0sXG4gICAgcm9sZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnZ3Vlc3QnLCAnc3R1ZGVudCcsICd0ZWFjaGVyJywgJ3Jlc2VhcmNoZXInLCAnc2NpZW50aXN0J10sIGRlZmF1bHQ6ICdzdHVkZW50JyB9LFxuICB9LFxuICB7IHRpbWVzdGFtcHM6IHRydWUgfVxuKTtcblxuY29uc3QgVXNlck1vZGVsID0gbW9kZWxzLlVzZXIgfHwgbW9kZWwoJ1VzZXInLCBVc2VyU2NoZW1hKTtcbmV4cG9ydCBkZWZhdWx0IFVzZXJNb2RlbDtcbiJdLCJuYW1lcyI6WyJTY2hlbWEiLCJtb2RlbCIsIm1vZGVscyIsIlVzZXJTY2hlbWEiLCJuYW1lIiwiU3RyaW5nIiwiZW1haWwiLCJ0eXBlIiwidW5pcXVlIiwiaW5kZXgiLCJyb2xlIiwiZW51bSIsImRlZmF1bHQiLCJ0aW1lc3RhbXBzIiwiVXNlck1vZGVsIiwiVXNlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/models/User.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/mongo.ts":
/*!**************************!*\
  !*** ./src/lib/mongo.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectToDatabase: () => (/* binding */ connectToDatabase)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI || \"\";\nif (!MONGODB_URI) {\n    console.warn(\"MONGODB_URI not set. Database operations will fail.\");\n}\nlet cached = global.mongooseConn;\nif (!cached) {\n    cached = global.mongooseConn = {\n        conn: null,\n        promise: null\n    };\n}\nasync function connectToDatabase() {\n    if (cached.conn) return cached.conn;\n    if (!cached.promise) {\n        const opts = {\n            bufferCommands: false,\n            dbName: process.env.MONGODB_DB || undefined\n        };\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, opts).then((m)=>m);\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL21vbmdvLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFnQztBQUVoQyxNQUFNQyxjQUFjQyxRQUFRQyxHQUFHLENBQUNGLFdBQVcsSUFBSTtBQUUvQyxJQUFJLENBQUNBLGFBQWE7SUFDaEJHLFFBQVFDLElBQUksQ0FBQztBQUNmO0FBT0EsSUFBSUMsU0FBU0MsT0FBT0MsWUFBWTtBQUVoQyxJQUFJLENBQUNGLFFBQVE7SUFDWEEsU0FBU0MsT0FBT0MsWUFBWSxHQUFHO1FBQUVDLE1BQU07UUFBTUMsU0FBUztJQUFLO0FBQzdEO0FBRU8sZUFBZUM7SUFDcEIsSUFBSUwsT0FBUUcsSUFBSSxFQUFFLE9BQU9ILE9BQVFHLElBQUk7SUFDckMsSUFBSSxDQUFDSCxPQUFRSSxPQUFPLEVBQUU7UUFDcEIsTUFBTUUsT0FBTztZQUNYQyxnQkFBZ0I7WUFDaEJDLFFBQVFaLFFBQVFDLEdBQUcsQ0FBQ1ksVUFBVSxJQUFJQztRQUNwQztRQUNBVixPQUFRSSxPQUFPLEdBQUdWLHVEQUFnQixDQUFDQyxhQUFhVyxNQUFNTSxJQUFJLENBQUMsQ0FBQ0MsSUFBTUE7SUFDcEU7SUFDQWIsT0FBUUcsSUFBSSxHQUFHLE1BQU1ILE9BQVFJLE9BQU87SUFDcEMsT0FBT0osT0FBUUcsSUFBSTtBQUNyQiIsInNvdXJjZXMiOlsid2VicGFjazovL3NwYWNlLWJpby1rbm93bGVkZ2UtZW5naW5lLy4vc3JjL2xpYi9tb25nby50cz81YzA0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5cbmNvbnN0IE1PTkdPREJfVVJJID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkgfHwgJyc7XG5cbmlmICghTU9OR09EQl9VUkkpIHtcbiAgY29uc29sZS53YXJuKCdNT05HT0RCX1VSSSBub3Qgc2V0LiBEYXRhYmFzZSBvcGVyYXRpb25zIHdpbGwgZmFpbC4nKTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyXG4gIHZhciBtb25nb29zZUNvbm46IHsgY29ubjogdHlwZW9mIG1vbmdvb3NlIHwgbnVsbDsgcHJvbWlzZTogUHJvbWlzZTx0eXBlb2YgbW9uZ29vc2U+IHwgbnVsbCB9IHwgdW5kZWZpbmVkO1xufVxuXG5sZXQgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlQ29ubjtcblxuaWYgKCFjYWNoZWQpIHtcbiAgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlQ29ubiA9IHsgY29ubjogbnVsbCwgcHJvbWlzZTogbnVsbCB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29ubmVjdFRvRGF0YWJhc2UoKSB7XG4gIGlmIChjYWNoZWQhLmNvbm4pIHJldHVybiBjYWNoZWQhLmNvbm47XG4gIGlmICghY2FjaGVkIS5wcm9taXNlKSB7XG4gICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgIGJ1ZmZlckNvbW1hbmRzOiBmYWxzZSxcbiAgICAgIGRiTmFtZTogcHJvY2Vzcy5lbnYuTU9OR09EQl9EQiB8fCB1bmRlZmluZWQsXG4gICAgfSBhcyBhbnk7XG4gICAgY2FjaGVkIS5wcm9taXNlID0gbW9uZ29vc2UuY29ubmVjdChNT05HT0RCX1VSSSwgb3B0cykudGhlbigobSkgPT4gbSk7XG4gIH1cbiAgY2FjaGVkIS5jb25uID0gYXdhaXQgY2FjaGVkIS5wcm9taXNlO1xuICByZXR1cm4gY2FjaGVkIS5jb25uO1xufVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiTU9OR09EQl9VUkkiLCJwcm9jZXNzIiwiZW52IiwiY29uc29sZSIsIndhcm4iLCJjYWNoZWQiLCJnbG9iYWwiLCJtb25nb29zZUNvbm4iLCJjb25uIiwicHJvbWlzZSIsImNvbm5lY3RUb0RhdGFiYXNlIiwib3B0cyIsImJ1ZmZlckNvbW1hbmRzIiwiZGJOYW1lIiwiTU9OR09EQl9EQiIsInVuZGVmaW5lZCIsImNvbm5lY3QiLCJ0aGVuIiwibSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/mongo.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyelugodlashivaraj%2FCascadeProjects%2Fnasa-space-biology-engine%2Fai-backend%2Fsrc%2Fcontrollers%2Fnasa.intercollege1%2Fnasa%20mvp%2Fnasa_MVP1%2Fspace-bio-knowledge-engine&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();