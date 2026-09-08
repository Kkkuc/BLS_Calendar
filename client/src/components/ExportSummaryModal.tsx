import React from 'react';
import type { ExportSummaryData } from './ExportConfirmModal';
import styles from './Modal.module.css';

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
        <div className={styles.overlay}>
            <div className={`${styles.modalCard} ${styles.centered}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Eksport do Google Calendar</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeBtn}
                        title="Zamknij"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.summaryIcon}>✅</div>
                <h3 className={`${styles.title} ${styles.summaryTitle}`}>Eksport zakończony</h3>

                <p className={styles.description}>
                    Dodano wybrane mecze!
                </p>

                <div className={styles.matchesList}>
                    {summary.details.length === 0 ? (
                        <p className={styles.textMuted}>Pomyślnie przetworzono mecze.</p>
                    ) : (
                        summary.details.map((item, idx) => (
                            <div key={idx} className={styles.matchItem}>
                                <span className={`${styles.matchTeams} ${styles.truncate}`} title={item.match}>
                                    {item.match}
                                </span>
                                <span className={styles.summaryTag}>
                                    DODANO
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.actionsColumn}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onRetry}
                    >
                        🔄 Dodaj mecz ponownie
                    </button>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={onResetTeamSelection}
                    >
                        🏠 Wybór drużyny
                    </button>
                </div>
            </div>
        </div>
    );
};