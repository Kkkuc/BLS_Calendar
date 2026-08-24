import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { MatchDto } from '../types/match';

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

    const sendMatchesToBackend = async (accessToken: string) => {
        try {
            const response = await fetch('/api/calendar/export', {
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
            setError(err.message || 'Wystąpił błąd.');
        } finally {
            setIsExporting(false);
        }
    };

    const loginAndExport = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/calendar',
        onSuccess: async (tokenResponse) => {
            await sendMatchesToBackend(tokenResponse.access_token);
        },
        onError: () => {
            setError('Nie udało się autoryzować konta Google.');
            setIsExporting(false);
        },
    });

    if (!isOpen) return null;

    const handleConfirm = () => {
        setIsExporting(true);
        setError(null);
        loginAndExport();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        Eksport do Google Calendar
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Zamierzasz dodać <span className="font-semibold">{matches.length}</span> mecz(y) do swojego kalendarza:
                </p>

                <div className="max-h-48 overflow-y-auto mb-4 border border-gray-200 rounded p-2 text-xs divide-y divide-gray-100">
                    {matches.map((match, idx) => {
                        const host = match.host || (match as any).Host || 'Gospodarz';
                        const guest = match.guest || (match as any).Guest || 'Gość';
                        const rawDate = match.matchDate || (match as any).MatchDate;

                        return (
                            <div key={idx} className="py-2 flex justify-between items-center gap-2">
                                <span className="font-medium text-gray-800">
                                    {host} <span className="text-gray-400 font-normal">vs</span> {guest}
                                </span>
                                <span className="text-gray-500 whitespace-nowrap">
                                    {rawDate ? new Date(rawDate).toLocaleString('pl-PL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '-'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className="p-3 mb-4 text-xs bg-red-50 text-red-600 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        onClick={onClose}
                        disabled={isExporting}
                    >
                        Anuluj
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50 transition"
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