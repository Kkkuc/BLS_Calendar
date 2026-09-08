import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { MatchDto } from '../types/match';
import { apiFetch } from '../services/api.ts';
import styles from './Modal.module.css';

export interface ExportSummaryData {
    added: number;
    details: Array<{ match: string; status: string; message: string }>;
}

interface ExportConfirmModalProps {
    matches: MatchDto[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: ExportSummaryData) => void;
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
                                                                          matches,
                                                                          isOpen,
                                                                          onClose,
                                                                          onSuccess,
                                                                      }) => {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setIsExporting(false);
        setError(null);
        onClose();
    };

    const sendMatchesToBackend = async (accessToken: string) => {
        try {
            const response = await apiFetch('/api/calendar/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ matches }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || 'Nie udało się wyeksportować meczów.');
            }

            onSuccess({
                added: data.summary?.addedCount ?? data.summary?.added ?? 0,
                details: data.details ?? [],
            });
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas wysyłania meczów.');
        } finally {
            setIsExporting(false);
        }
    };

    const loginAndExport = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/calendar.events',
        include_granted_scopes: false,
        onSuccess: async (tokenResponse) => {
            await sendMatchesToBackend(tokenResponse.access_token);
        },
        onError: (errorResponse) => {
            console.error('Google Auth Error:', errorResponse);
            setError('Autoryzacja Google nie powiodła się lub została anulowana.');
            setIsExporting(false);
        },
        onNonOAuthError: () => {
            setError('Zamknięto okno logowania Google.');
            setIsExporting(false);
        }
    });

    if (!isOpen) return null;

    const handleConfirm = () => {
        setIsExporting(true);
        setError(null);
        try {
            loginAndExport();
        } catch (e) {
            setError('Nie udało się otworzyć okna logowania.');
            setIsExporting(false);
        }
    };

    const formatDate = (rawDate: string | Date | undefined) => {
        if (!rawDate) return '-';
        return new Date(rawDate).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalCard}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Eksport do Google Calendar</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className={styles.closeBtn}
                        title="Zamknij"
                    >
                        ✕
                    </button>
                </div>

                <p className={styles.description}>
                    Zamierzasz dodać <strong className={styles.textAccent}>{matches.length}</strong> mecz(e) do swojego kalendarza:
                </p>

                <div className={styles.matchesList}>
                    {matches.map((match, idx) => {
                        const host = match.host || (match as any).Host || 'Gospodarz';
                        const guest = match.guest || (match as any).Guest || 'Gość';
                        const rawDate = match.matchDate || (match as any).MatchDate;

                        return (
                            <div key={idx} className={styles.matchItem}>
                                <span className={styles.matchTeams}>
                                    {host} <span className={styles.textMuted}>vs</span> {guest}
                                </span>
                                <span className={styles.matchDate}>
                                    {formatDate(rawDate)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className={styles.errorState}>
                        {error}
                    </div>
                )}

                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleClose}
                    >
                        Anuluj
                    </button>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={handleConfirm}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Autoryzacja...' : 'Zaloguj przez Google i dodaj'}
                    </button>
                </div>
            </div>
        </div>
    );
};