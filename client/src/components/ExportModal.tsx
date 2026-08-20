import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { MatchDto } from '../types/match';

interface ExportModalProps {
    matches: MatchDto[];
    isOpen: boolean;
    onClose: () => void;
    onResetTeamSelection: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
                                                            matches,
                                                            isOpen,
                                                            onClose,
                                                            onResetTeamSelection,
                                                        }) => {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Wysyłka danych do backendu C# z otrzymanym tokenem
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
                throw new Error(data?.message || 'Nie udało się wyeksportować meczów do Google Calendar.');
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Wystąpił nieoczekiwany błąd podczas eksportu.');
        } finally {
            setIsExporting(false);
        }
    };

    // OAuth Pop-up wywoływany przy kliknięciu przycisku
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
        loginAndExport(); // Otwiera okienko wyboru konta Google
    };

    const handleRetry = () => {
        setIsSuccess(false);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">

                {/* 1. Ekran sukcesu */}
                {isSuccess ? (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Pomyślnie wyeksportowano mecze!
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Mecze ({matches.length}) zostały dodane do Twojego Google Calendar.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
                                onClick={handleRetry}
                            >
                                🔄 Wyślij jeszcze raz
                            </button>
                            <button
                                type="button"
                                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition"
                                onClick={onResetTeamSelection}
                            >
                                🏠 Powrót do wyboru drużyny
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 2. Ekran potwierdzenia wysyłki */
                    <div>
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

                        {/* Podgląd wybranych meczów */}
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
                )}
            </div>
        </div>
    );
};