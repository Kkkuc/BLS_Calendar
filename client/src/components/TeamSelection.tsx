import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../types';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
}

export default function TeamSelection({ onSelectTeam }: TeamSelectionProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedLeague, setSelectedLeague] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    useEffect(() => {
        async function loadTeams() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/teams');
                if (!response.ok) {
                    throw new Error(`Błąd serwera HTTP: ${response.status}`);
                }

                const data: Team[] = await response.json();
                setTeams(data);
            } catch (err: any) {
                console.error("Błąd pobierania drużyn:", err);
                setError("Nie udało się pobrać listy drużyn z serwera.");
            } finally {
                setIsLoading(false);
            }
        }

        loadTeams();
    }, []);

    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            const matchesLeague = team.league ? team.league === selectedLeague : true;
            const matchesSearch = team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesLeague && matchesSearch;
        });
    }, [teams, selectedLeague, searchQuery]);

    if (isLoading) {
        return (
            <div className="card loading-state">
                <p>Pobieranie aktywnych drużyn z serwera...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Spróbuj ponownie</button>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="league-switch">
                <button
                    className={`tab-button ${selectedLeague === 1 ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedLeague(1);
                        setSelectedTeam(null);
                    }}
                >
                    I Liga
                </button>
                <button
                    className={`tab-button ${selectedLeague === 2 ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedLeague(2);
                        setSelectedTeam(null);
                    }}
                >
                    II Liga
                </button>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Szukaj drużyny..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="team-list">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                        <div
                            key={team.id}
                            className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTeam(team)}
                        >
                            <span>{team.name}</span>
                            {selectedTeam?.id === team.id && <span className="badge">Wybrano</span>}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">Brak aktywnych drużyn do wyświetlenia.</div>
                )}
            </div>

            <div className="action-footer">
                <button
                    className="submit-btn"
                    disabled={!selectedTeam}
                    onClick={() => selectedTeam && onSelectTeam(selectedTeam)}
                >
                    {selectedTeam ? `Pobierz mecze dla: ${selectedTeam.name}` : 'Wybierz drużynę'}
                </button>
            </div>
        </div>
    );
}