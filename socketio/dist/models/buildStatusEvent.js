"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BuildStatusEvent {
    get channels() {
        return ['all', this.build_id];
    }
}
exports.BuildStatusEvent = BuildStatusEvent;
//# sourceMappingURL=buildStatusEvent.js.map