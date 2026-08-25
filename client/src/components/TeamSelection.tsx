import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../types';
import { apiFetch } from '../services/api.ts';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
    selectedTeamId?: number | null;
}

export default function TeamSelection({ onSelectTeam, selectedTeamId }: TeamSelectionProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedLeague] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Domyślne logo z folderu public
    const defaultLogo = "/default-logo.png";

    useEffect(() => {
        async function loadTeams() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiFetch('/api/teams');
                if (!response.ok) {
                    throw new Error(`Błąd serwera HTTP: ${response.status}`);
                }

                const data: Team[] = await response.json();

                // Poprawione przefiltrowanie nieprawidłowych wpisów
                const cleanTeams = data.filter((team) => {
                    const invalidNames = ['najnowsze wiadomości', 'błąd', 'szanowni użytkownicy'];
                    return !invalidNames.some((invalid) => team.name.toLowerCase().includes(invalid));
                });

                setTeams(cleanTeams);

                if (selectedTeamId) {
                    const found = cleanTeams.find((t) => t.id === selectedTeamId);
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
        <div className="card flashscore-card">
            {/* Wyszukiwarka */}
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Szukaj drużyny..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Lista drużyn */}
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
                                <div className="team-info">
                                    <img
                                        src={team.logoUrl || defaultLogo}
                                        alt={team.name}
                                        className="team-logo"
                                        onError={(e) => {
                                            // Fallback do domyślnego logo w razie błędu wczytywania URL
                                            (e.target as HTMLImageElement).src = defaultLogo;
                                        }}
                                    />
                                    <span className="team-name">{team.name}</span>
                                </div>
                                <div className="team-comment">Kliknij aby wybrać</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">Brak aktywnych drużyn do wyświetlenia.</div>
                )}
            </div>

            {/* Przycisk akcji */}
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