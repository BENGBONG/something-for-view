(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.BaizhiRecycleState = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalizeSpace = (space) => space === "enterprise" ? "enterprise" : "personal";

  function createAssetStore(initial = {}) {
    const state = {
      knowledge: clone(initial.knowledge || []),
      meetings: clone(initial.meetings || []),
      recycle: clone(initial.recycle || [])
    };
    let sequence = state.recycle.length;

    const moveToRecycle = (collectionName, id, type) => {
      const collection = state[collectionName];
      const index = collection.findIndex((item) => item.id === id);
      if (index < 0) return null;
      const [item] = collection.splice(index, 1);
      const recycled = {
        recycleId: `recycle-${Date.now()}-${sequence += 1}`,
        type,
        space: normalizeSpace(item.space),
        originalLocation: item.folder || (type === "meeting" ? "我的会议" : "我的文件"),
        deletedAt: new Date().toISOString(),
        expiresInDays: 30,
        item: clone(item),
        name: item.name,
        size: item.size || "-"
      };
      state.recycle.unshift(recycled);
      return clone(recycled);
    };

    return {
      addKnowledge(item) { state.knowledge.push(clone(item)); return clone(item); },
      addMeeting(item) { state.meetings.push(clone(item)); return clone(item); },
      deleteKnowledge(id) { return moveToRecycle("knowledge", id, "knowledge"); },
      deleteMeeting(id) { return moveToRecycle("meetings", id, "meeting"); },
      restore(recycleId) {
        const index = state.recycle.findIndex((item) => item.recycleId === recycleId);
        if (index < 0) return null;
        const [recycled] = state.recycle.splice(index, 1);
        state[recycled.type === "meeting" ? "meetings" : "knowledge"].push(clone(recycled.item));
        return clone(recycled);
      },
      permanentlyDelete(recycleId) {
        const index = state.recycle.findIndex((item) => item.recycleId === recycleId);
        if (index < 0) return false;
        state.recycle.splice(index, 1);
        return true;
      },
      getKnowledge() { return clone(state.knowledge); },
      getMeetings() { return clone(state.meetings); },
      getRecycleItems(options = {}) {
        const edition = options.edition === "personal" ? "personal" : "enterprise";
        const requestedSpace = options.space || (edition === "personal" ? "personal" : null);
        return clone(state.recycle.filter((item) => {
          if (edition === "personal" && item.space !== "personal") return false;
          return !requestedSpace || item.space === requestedSpace;
        }));
      }
    };
  }

  function getStorageSummary(input = {}) {
    const totalBytes = Math.max(0, Number(input.totalBytes) || 0);
    const usedBytes = Math.min(totalBytes, Math.max(0, Number(input.usedBytes) || 0));
    return {
      totalBytes,
      usedBytes,
      remainingBytes: totalBytes - usedBytes,
      usedPercent: totalBytes ? usedBytes / totalBytes * 100 : 0
    };
  }

  return { createAssetStore, getStorageSummary };
});
