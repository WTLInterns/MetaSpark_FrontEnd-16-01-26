import React from 'react';

export default function StatusHistoryTimeline({
  statusHistory,
  loadingHistory,
  getStatusBadgeClasses,
  getStatusDisplayMessage,
  onSelectAttachment,
  userLabel = 'Admin User',
  userInitials = 'AU',
}) {
  const isInspectionSendBack = (status) => {
    const from = (status?.oldStatus || '').toString().trim().toUpperCase();
    const to = (status?.newStatus || '').toString().trim().toUpperCase();
    if (!from || !to) return false;

    const isFromInspection = from === 'INSPECTION';
    const isToReworkTarget = to === 'DESIGN' || to === 'PRODUCTION' || to === 'MACHINING';
    const isNotCompleted = to !== 'COMPLETED';

    return isFromInspection && isToReworkTarget && isNotCompleted;
  };

  const isNonEmptyNonJsonComment = (status) => {
    const rawComment = status?.comment != null ? String(status.comment) : '';
    const trimmed = rawComment.trim();
    if (!trimmed) return false;

    const isJsonLike = (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
    return !isJsonLike;
  };

  const getTrimmedComment = (status) => {
    const rawComment = status?.comment != null ? String(status.comment) : '';
    return rawComment.trim();
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-2">
        <h3 className="font-semibold text-black">Status History</h3>
        <p className="text-xs text-gray-500 mt-0.5">A log of all status changes for this order.</p>
      </div>

      {loadingHistory ? (
        <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
          Loading history...
        </div>
      ) : statusHistory.length > 0 ? (
        <div className="space-y-5">
          {statusHistory.map((status) => {
            const fileName = status.attachmentUrl ? status.attachmentUrl.split('/').pop() : '';

            const hasIssueComment = isInspectionSendBack(status) && isNonEmptyNonJsonComment(status);
            const issueComment = hasIssueComment ? getTrimmedComment(status) : '';

            return (
              <div key={status.id} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-semibold text-gray-700">{userInitials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{userLabel}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getStatusBadgeClasses(status.oldStatus)}>{status.oldStatus || '—'}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className={getStatusBadgeClasses(status.newStatus)}>{status.newStatus || '—'}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {getStatusDisplayMessage(status)}
                    </p>
                    {issueComment && (
                      <p className="text-sm text-red-700 mb-2">Issue : {issueComment}</p>
                    )}
                    {status.attachmentUrl && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500 uppercase tracking-wide">
                          <span className="text-[13px]">Paperclip</span>
                          <span>Attachments</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectAttachment(status.attachmentUrl)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-800 hover:bg-gray-200 border border-gray-200"
                        >
                          <span>Download</span>
                          <span className="truncate max-w-[160px] text-left">{fileName || 'Download attachment'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap mt-1">{status.createdAt}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
          No status history available
        </div>
      )}
    </section>
  );
}
