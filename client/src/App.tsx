import { useState } from 'react';
import type {Team} from './types';
import TeamSelection from './components/TeamSelection';
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
                    <div className="card">
                        <h2>Wybrana drużyna: {selectedTeam.name}</h2>
                        <p>Tutaj wczytamy listę meczów z C#...</p>
                        <button onClick={() => setSelectedTeam(null)}>Zmiana drużyny</button>
                    </div>
                )}
            </main>
        </div>
    );
}