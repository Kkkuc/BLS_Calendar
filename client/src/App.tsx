import { useState } from 'react';
import type { Team } from './types';
import TeamSelection from './components/TeamSelection';
import { MatchList } from './components/MatchList';
import './App.css';

export default function App() {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    return (
        <div className="app-container">
            <header className="header">
                <h1>🏐 BLS Calendar Integrator</h1>
                <p>Wybierz drużynę, aby pobrać nadchodzące mecze</p>
            </header>

            <main>
                {!selectedTeam ? (
                    <TeamSelection onSelectTeam={(team) => setSelectedTeam(team)} />
                ) : (
                    <div className="selected-team-container">
                        <div className="card mb-4 flex justify-between items-center">
                            <div>
                                <span className="text-sm text-gray-500">Wybrany zespół:</span>
                                <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                            </div>
                            <button
                                className="change-team-btn"
                                onClick={() => setSelectedTeam(null)}
                            >
                                🔄 Zmień drużynę
                            </button>
                        </div>

                        {/* Wczytanie listy meczów z C# */}
                        <MatchList
                            teamId={selectedTeam.id}
                            teamName={selectedTeam.name}
                            onExportSelected={(selectedMatches) => {
                                console.log('Mecze do wyeksportowania do Google Calendar:', selectedMatches);
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}