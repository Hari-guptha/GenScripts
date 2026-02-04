"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceType = exports.PaperStatus = exports.LLMProvider = exports.PaperSection = void 0;
var PaperSection;
(function (PaperSection) {
    PaperSection["TITLE"] = "title";
    PaperSection["ABSTRACT"] = "abstract";
    PaperSection["KEYWORDS"] = "keywords";
    PaperSection["INTRODUCTION"] = "introduction";
    PaperSection["LITERATURE_REVIEW"] = "literature_review";
    PaperSection["METHODOLOGY"] = "methodology";
    PaperSection["RESULTS"] = "results";
    PaperSection["DISCUSSION"] = "discussion";
    PaperSection["CONCLUSION"] = "conclusion";
    PaperSection["REFERENCES"] = "references";
    PaperSection["APPENDICES"] = "appendices";
})(PaperSection || (exports.PaperSection = PaperSection = {}));
var LLMProvider;
(function (LLMProvider) {
    LLMProvider["OPENAI"] = "openai";
    LLMProvider["GEMINI"] = "gemini";
    LLMProvider["AZURE"] = "azure";
})(LLMProvider || (exports.LLMProvider = LLMProvider = {}));
var PaperStatus;
(function (PaperStatus) {
    PaperStatus["DRAFT"] = "draft";
    PaperStatus["COLLECTING"] = "collecting";
    PaperStatus["EXTRACTING"] = "extracting";
    PaperStatus["GENERATING"] = "generating";
    PaperStatus["FORMATTING"] = "formatting";
    PaperStatus["COMPLETED"] = "completed";
    PaperStatus["FAILED"] = "failed";
})(PaperStatus || (exports.PaperStatus = PaperStatus = {}));
var SourceType;
(function (SourceType) {
    SourceType["WEB_CRAWLER"] = "web_crawler";
    SourceType["FILE_UPLOAD"] = "file_upload";
    SourceType["RESEARCH_PAPER"] = "research_paper";
})(SourceType || (exports.SourceType = SourceType = {}));
//# sourceMappingURL=index.js.map