import {useState, useEffect} from 'react';
import type {Team} from './types';
import type {MatchDto} from './types/match';
import TeamSelection from './components/TeamSelection/TeamSelection.tsx';
import {MatchList} from './components/MatchList/MatchList.tsx';
import {ExportConfirmModal, type ExportSummaryData} from './components/ExportConfirmModal';
import {ExportSummaryModal} from './components/ExportSummaryModal';
import './App.css';

export default function App() {
    // Inicjalizacja wybranej drużyny z sessionStorage
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(() => {
        const savedTeam = sessionStorage.getItem('selectedTeam');
        return savedTeam ? JSON.parse(savedTeam) : null;
    });

    const [matchesToExport, setMatchesToExport] = useState<MatchDto[]>([]);
    const [exportStep, setExportStep] = useState<'closed' | 'confirm' | 'summary'>('closed');
    const [summaryData, setSummaryData] = useState<ExportSummaryData | null>(null);

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });

    // Synchronizacja historii przeglądarki (obsługa przycisku Wstecz / strzałki na telefonie)
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state;

            if (!state) {
                setSelectedTeam(null);
                setExportStep('closed');
                return;
            }

            setSelectedTeam(state.selectedTeam || null);
            setExportStep(state.exportStep || 'closed');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Pomocnicza funkcja do bezpiecznej zmiany stanu z jednoczesnym dodaniem wpisu do historii
    const updateNavigationState = (newTeam: Team | null, newStep: 'closed' | 'confirm' | 'summary', push: boolean = true) => {
        if (push) {
            window.history.pushState(
                {selectedTeam: newTeam, exportStep: newStep},
                '',
                newTeam ? `#team-${newTeam.id}` : window.location.pathname
            );
        }

        setSelectedTeam(newTeam);
        setExportStep(newStep);

        if (newTeam) {
            sessionStorage.setItem('selectedTeam', JSON.stringify(newTeam));
        } else {
            sessionStorage.removeItem('selectedTeam');
        }
    };

    // Inicjalny wpis w historii po załadowaniu, jeśli drużyna była już w session storage
    useEffect(() => {
        if (selectedTeam && window.history.state === null) {
            window.history.replaceState({selectedTeam, exportStep}, '', `#team-${selectedTeam.id}`);
        }
    }, []);

    const handleSelectTeam = (team: Team | null) => {
        updateNavigationState(team, 'closed', true);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (exportStep !== 'closed') {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [theme, exportStep]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleOpenExportModal = (matches: MatchDto[]) => {
        setMatchesToExport(matches);
        updateNavigationState(selectedTeam, 'confirm', true);
    };

    const handleExportSuccess = (data: ExportSummaryData) => {
        setSummaryData(data);
        updateNavigationState(selectedTeam, 'summary', true);
    };

    const handleCloseModal = () => {
        window.history.back();
    };

    const handleResetAll = () => {
        setSummaryData(null);
        setMatchesToExport([]);
        updateNavigationState(null, 'closed', true);
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        {selectedTeam ? (
                            <button
                                onClick={() => handleSelectTeam(null)}
                                className="navbar-brand-item back-navbar-btn"
                            >
                                ← Wybór drużyny
                            </button>
                        ) : (
                            <span className="navbar-brand-item navbar-title">
                                Wybór drużyny
                            </span>
                        )}

                        <a
                            href="https://blssiatkowka.ligspace.pl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link secondary-link"
                        >
                            <span className="text-xs">Ligspace BLS ↗</span>
                        </a>
                    </div>

                    <div className="navbar-actions">
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
                </div>
            </nav>

            <div className="main-content">
                <header className="header">
                    <img
                        src="/front_logo_BLS.jpg"
                        alt="Białostocka Liga Sportu"
                        className="bls-logo"
                    />
                </header>

                <main>
                    {!selectedTeam ? (
                        <TeamSelection onSelectTeam={handleSelectTeam}/>
                    ) : (
                        <MatchList
                            team={selectedTeam}
                            onBack={() => handleSelectTeam(null)}
                            onExportSelected={handleOpenExportModal}
                        />
                    )}
                </main>

                <ExportConfirmModal
                    isOpen={exportStep === 'confirm'}
                    matches={matchesToExport}
                    onClose={handleCloseModal}
                    onSuccess={handleExportSuccess}
                />

                <ExportSummaryModal
                    isOpen={exportStep === 'summary'}
                    summary={summaryData}
                    onClose={handleCloseModal}
                    onRetry={() => updateNavigationState(selectedTeam, 'confirm', true)}
                    onResetTeamSelection={handleResetAll}
                />
            </div>
        </div>
    );
}