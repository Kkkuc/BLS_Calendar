import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../types';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
    selectedTeamId?: number | null;
}

export default function TeamSelection({ onSelectTeam, selectedTeamId }: TeamSelectionProps) {
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

                // Zaznacz drużynę, jeśli jej ID przyszło w propsach z rodzica
                if (selectedTeamId) {
                    const found = data.find((t) => t.id === selectedTeamId);
                    if (found) setSelectedTeam(found);
                }
            } catch (err: any) {
                console.error("Błąd pobierania drużyn:", err);
                setError("Nie udało się pobrać listy drużyn z serwera.");
            } finally {
                setIsLoading(false);
            }
        }

        loadTeams();
    }, [selectedTeamId]);

    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            // Bezpieczne porównanie ligi (niezależnie czy w API jest string "1", number 1 czy "I Liga")
            const matchesLeague = team.league
                ? team.league.toString().includes(selectedLeague.toString())
                : true;

            const matchesSearch = team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase().trim());

            return matchesLeague && matchesSearch;
        });
    }, [teams, selectedLeague, searchQuery]);

    const handleTeamClick = (team: Team) => {
        setSelectedTeam(team);
    };

    const handleSubmit = () => {
        if (selectedTeam) {
            // Wywołujemy przekazanie do rodzica (np. App.tsx), co uruchomi MatchList
            onSelectTeam(selectedTeam);
        }
    };

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
                    type="button"
                    className={`tab-button ${selectedLeague === 1 ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedLeague(1);
                        setSelectedTeam(null);
                    }}
                >
                    I Liga
                </button>
                <button
                    type="button"
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
                    filteredTeams.map((team) => {
                        const isSelected = selectedTeam?.id === team.id;
                        return (
                            <div
                                key={team.id}
                                className={`team-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleTeamClick(team)}
                            >
                                <span>{team.name}</span>
                                {isSelected && <span className="badge">Wybrano</span>}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">Brak aktywnych drużyn do wyświetlenia.</div>
                )}
            </div>

            <div className="action-footer">
                <button
                    type="button"
                    className="submit-btn"
                    disabled={!selectedTeam}
                    onClick={handleSubmit}
                >
                    {selectedTeam ? `Pobierz mecze dla: ${selectedTeam.name}` : 'Wybierz drużynę'}
                </button>
            </div>
        </div>
    );
}