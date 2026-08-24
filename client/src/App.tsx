import {useState, useEffect} from 'react';
import type {Team} from './types';
import type {MatchDto} from './types/match';
import TeamSelection from './components/TeamSelection';
import {MatchList} from './components/MatchList';
import {ExportConfirmModal, type ExportSummaryData} from './components/ExportConfirmModal';
import {ExportSummaryModal} from './components/ExportSummaryModal';
import './App.css';

export default function App() {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [matchesToExport, setMatchesToExport] = useState<MatchDto[]>([]);

    const [exportStep, setExportStep] = useState<'closed' | 'confirm' | 'summary'>('closed');
    const [summaryData, setSummaryData] = useState<ExportSummaryData | null>(null);

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

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
                <div className="top-bar">
                    <label className="theme-switch" title="Zmień motyw">
                        <input
                            type="checkbox"
                            onChange={toggleTheme}
                            checked={theme === 'light'}
                        />
                        <span className="slider">
                            <span className="icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                        </span>
                    </label>
                </div>


                <img
                    src="public/front_logo_BLS.jpg"
                    alt="Białostocka Liga Sportu"
                    className="bls-logo"
                />
                {/*<p className="header-subtitle">Integrator Kalendarza Google</p>*/}
            </header>

            <main>
                {!selectedTeam ? (
                    <TeamSelection onSelectTeam={(team) => setSelectedTeam(team)}/>
                ) : (
                    <div className="selected-team-container">
                        <div className="card mb-4 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-400">Wybrany zespół:</span>
                                <h2 className="text-lg font-bold">{selectedTeam.name}</h2>
                            </div>
                            <button
                                className="change-team-btn"
                                onClick={() => setSelectedTeam(null)}
                            >
                                🔄 Zmień
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

            <ExportConfirmModal
                isOpen={exportStep === 'confirm'}
                matches={matchesToExport}
                onClose={() => setExportStep('closed')}
                onSuccess={handleExportSuccess}
            />

            <ExportSummaryModal
                isOpen={exportStep === 'summary'}
                summary={summaryData}
                onRetry={() => setExportStep('confirm')}
                onResetTeamSelection={handleResetAll}
            />
        </div>
    );
}