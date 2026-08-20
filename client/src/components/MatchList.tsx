import React, { useEffect, useState } from 'react';
import type { MatchDto } from '../types/match';

interface MatchListProps {
    teamId: number | null;
    teamName?: string;
    onExportSelected?: (selectedMatches: MatchDto[]) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ teamId, teamName, onExportSelected }) => {
    const [matches, setMatches] = useState<MatchDto[]>([]);
    const [selectedMatches, setSelectedMatches] = useState<MatchDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teamId) return;

        const fetchMatches = async () => {
            setLoading(true);
            setError(null);
            try {
                // Wywołanie zaktualizowanego endpointu w MatchesController (zamiast sztywnego http://localhost:5184 idzie przez proxy Vite)
                const response = await fetch(`/api/matches/unplayed/${teamId}`);

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać listy nierozegranych meczów.');
                }

                const data: MatchDto[] = await response.json();
                setMatches(data);
                setSelectedMatches(data);
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd podczas ładowania meczów.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [teamId]);

    // Unikalne porównanie po rundzie, gospodarzu i gościu (zamiast reference check .includes())
    const isMatchSelected = (match: MatchDto) => {
        return selectedMatches.some(
            (m) => m.round === match.round && m.host === match.host && m.guest === match.guest
        );
    };

    const toggleSelectMatch = (match: MatchDto) => {
        if (isMatchSelected(match)) {
            setSelectedMatches(
                selectedMatches.filter(
                    (m) => !(m.round === match.round && m.host === match.host && m.guest === match.guest)
                )
            );
        } else {
            setSelectedMatches([...selectedMatches, match]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedMatches.length === matches.length) {
            setSelectedMatches([]);
        } else {
            setSelectedMatches([...matches]);
        }
    };

    if (!teamId) {
        return <div className="p-4 text-gray-500">Wybierz drużynę, aby zobaczyć nadchodzące mecze.</div>;
    }

    if (loading) {
        return <div className="p-4 text-blue-600 font-medium">Ładowanie terminarza meczów z MatchesController...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 font-medium">{error}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Nierozegrane mecze {teamName ? `- ${teamName}` : ''}
                    </h2>
                    <p className="text-sm text-gray-500">Znaleziono: {matches.length}</p>
                </div>

                {matches.length > 0 && (
                    <button
                        onClick={() => onExportSelected && onExportSelected(selectedMatches)}
                        disabled={selectedMatches.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        Eksportuj do Kalendarza ({selectedMatches.length})
                    </button>
                )}
            </div>

            {matches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Brak nierozegranych meczów w najbliższym czasie.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                            <th className="p-3">
                                <input
                                    type="checkbox"
                                    checked={selectedMatches.length === matches.length && matches.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="p-3">Kolejka</th>
                            <th className="p-3">Gospodarz</th>
                            <th className="p-3">Gość</th>
                            <th className="p-3">Data i godzina</th>
                            <th className="p-3">Sektor / Hala</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                        {matches.map((match, index) => {
                            const selected = isMatchSelected(match);

                            // Bezpieczny parsowanie daty niezależnie od konwencji pól w C# (MatchDate / matchDate)
                            const rawDate = match.matchDate || (match as any).MatchDate;
                            const formattedDate = rawDate
                                ? new Date(rawDate).toLocaleString('pl-PL', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : 'Brak daty';

                            return (
                                <tr
                                    key={index}
                                    className={`hover:bg-blue-50 transition cursor-pointer ${
                                        selected ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => toggleSelectMatch(match)}
                                >
                                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleSelectMatch(match)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="p-3 font-medium text-gray-700">
                                        {match.round || (match as any).Round}
                                    </td>
                                    <td className="p-3 font-semibold text-gray-900">
                                        {match.host || (match as any).Host}
                                    </td>
                                    <td className="p-3 font-semibold text-gray-900">
                                        {match.guest || (match as any).Guest}
                                    </td>
                                    <td className="p-3 text-gray-600 whitespace-nowrap">{formattedDate}</td>
                                    <td className="p-3 text-gray-500">
                                        {match.court || (match as any).Court || '-'}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};