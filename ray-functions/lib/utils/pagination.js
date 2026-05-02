"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(data, total, { page, limit }) {
    return {
        data,
        total,
        page,
        hasMore: (page - 1) * limit + data.length < total,
    };
}
//# sourceMappingURL=pagination.js.map