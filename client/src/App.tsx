import { useState } from 'react';
import type { Team } from './types';
import type { MatchDto } from './types/match';
import TeamSelection from './components/TeamSelection';
import { MatchList } from './components/MatchList';
import { ExportModal } from './components/ExportModal';
import './App.css';

export default function App() {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [matchesToExport, setMatchesToExport] = useState<MatchDto[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleOpenExportModal = (matches: MatchDto[]) => {
        setMatchesToExport(matches);
        setIsModalOpen(true);
    };

    const handleResetAll = () => {
        setIsModalOpen(false);
        setMatchesToExport([]);
        setSelectedTeam(null);
    };

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

                        <MatchList
                            teamId={selectedTeam.id}
                            teamName={selectedTeam.name}
                            onExportSelected={handleOpenExportModal}
                        />
                    </div>
                )}
            </main>

            {/* Modal eksportu */}
            <ExportModal
                isOpen={isModalOpen}
                matches={matchesToExport}
                onClose={() => setIsModalOpen(false)}
                onResetTeamSelection={handleResetAll}
            />
        </div>
    );
}