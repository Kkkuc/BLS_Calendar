import React from 'react';
import type { ExportSummaryData } from './ExportConfirmModal';

interface ExportSummaryModalProps {
    isOpen: boolean;
    summary: ExportSummaryData | null;
    onRetry: () => void;
    onResetTeamSelection: () => void;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
                                                                          isOpen,
                                                                          summary,
                                                                          onRetry,
                                                                          onResetTeamSelection,
                                                                      }) => {
    if (!isOpen || !summary) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                    Eksport zakończony
                </h3>

                <p className="text-xs text-gray-600 mb-4">
                    Dodano meczów: <span className="font-semibold text-green-600">{summary.added}</span>
                </p>

                <div className="max-h-48 overflow-y-auto mb-5 border border-gray-200 rounded p-2 text-xs text-left divide-y divide-gray-100 bg-gray-50">
                    {summary.details.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-800 truncate" title={item.match}>
                                {item.match}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                                DODANO
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-xs transition"
                        onClick={onRetry}
                    >
                        🔄 Wyślij ponowne żądanie
                    </button>
                    <button
                        type="button"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-xs transition"
                        onClick={onResetTeamSelection}
                    >
                        🏠 Powrót do wyboru drużyny
                    </button>
                </div>
            </div>
        </div>
    );
};