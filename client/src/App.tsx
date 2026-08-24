import { useState } from 'react';
import type { Team } from './types';
import type { MatchDto } from './types/match';
import TeamSelection from './components/TeamSelection';
import { MatchList } from './components/MatchList';
import { ExportConfirmModal, type ExportSummaryData } from './components/ExportConfirmModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import './App.css';

export default function App() {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [matchesToExport, setMatchesToExport] = useState<MatchDto[]>([]);

    // Zarządzanie etapami eksportu
    const [exportStep, setExportStep] = useState<'closed' | 'confirm' | 'summary'>('closed');
    const [summaryData, setSummaryData] = useState<ExportSummaryData | null>(null);

    const handleOpenExportModal = (matches: MatchDto[]) => {
        setMatchesToExport(matches);
        setExportStep('confirm');
    };

    const handleExportSuccess = (data: ExportSummaryData) => {
        setSummaryData(data);
        setExportStep('summary');
    };

    const handleResetAll = () => {
        setExportStep('closed');
        setSummaryData(null);
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

            {/* Modal potwierdzenia eksportu */}
            <ExportConfirmModal
                isOpen={exportStep === 'confirm'}
                matches={matchesToExport}
                onClose={() => setExportStep('closed')}
                onSuccess={handleExportSuccess}
            />

            {/* Modal podsumowania eksportu */}
            <ExportSummaryModal
                isOpen={exportStep === 'summary'}
                summary={summaryData}
                onRetry={() => setExportStep('confirm')}
                onResetTeamSelection={handleResetAll}
            />
        </div>
    );
}