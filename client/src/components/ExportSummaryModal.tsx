import React from 'react';
import type { ExportSummaryData } from './ExportConfirmModal';

interface ExportSummaryModalProps {
    isOpen: boolean;
    summary: ExportSummaryData | null;
    onClose: () => void;
    onRetry: () => void;
    onResetTeamSelection: () => void;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
                                                                          isOpen,
                                                                          summary,
                                                                          onClose,
                                                                          onRetry,
                                                                          onResetTeamSelection,
                                                                      }) => {
    if (!isOpen || !summary) return null;

    return (
        <div className="modal-overlay">
            <div className="card modal-card text-center">
                <div className="modal-header">
                    <h3 className="modal-title">Eksport do Google Calendar</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        title="Zamknij"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="summary-icon">✅</div>
                <h3 className="modal-title summary-title">Eksport zakończony</h3>

                <p className="modal-description">
                    Dodano meczów: <strong className="summary-added-count">{summary.added}</strong>
                </p>

                <div className="modal-matches-list scrollable-matches-list">
                    {summary.details.length === 0 ? (
                        <p className="empty-text">Pomyślnie przetworzono mecze.</p>
                    ) : (
                        summary.details.map((item, idx) => (
                            <div key={idx} className="match-card-item unclickable modal-match-item">
                                <span className="match-teams truncate" title={item.match}>
                                    {item.match}
                                </span>
                                <span className="score-tag summary-tag">
                                    DODANO
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="modal-actions-column">
                    <button
                        type="button"
                        className="tab-button modal-retry-btn"
                        onClick={onRetry}
                    >
                        🔄 Dodaj mecz ponownie
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={onResetTeamSelection}
                    >
                        🏠 Wybór drużyny
                    </button>
                </div>
            </div>
        </div>
    );
};