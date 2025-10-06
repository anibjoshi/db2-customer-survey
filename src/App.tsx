import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Theme,
  Heading
} from '@carbon/react';
import { 
  UserAvatar, 
  Notification,
  Dashboard,
  ChartScatter
} from '@carbon/icons-react';
import { useSurveyConfig } from './hooks/useSurveyConfig';
import { SurveyRoute } from './routes/SurveyRoute';
import { DashboardPage, LoginPage, LandingPage } from './pages';
import './App.css';
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'admin2024';

function AppShell() {
  const { config, problems, groupColors, loading, error, reload } = useSurveyConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check auth status
  useEffect(() => {
    const auth = sessionStorage.getItem('zora_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('zora_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  if (loading) {
    return (
      <Theme theme="g90">
      <Header aria-label="IBM Db2 Survey">
        <HeaderName href="/" prefix="IBM">
          Db2 Survey
        </HeaderName>
      </Header>
      <Content id="main-content">
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <Heading>Loading survey...</Heading>
        </div>
      </Content>
      </Theme>
    );
  }

  if (error) {
    return (
      <Theme theme="g90">
      <Header aria-label="IBM Db2 Survey">
        <HeaderName href="/" prefix="IBM">
          Db2 Survey
        </HeaderName>
      </Header>
      <Content id="main-content">
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <Heading>Error loading survey</Heading>
          <p style={{ marginTop: '1rem' }}>{error}</p>
        </div>
      </Content>
      </Theme>
    );
  }

  const isDashboardRoute = location.pathname === '/dashboard';
  const isSurveyRoute = location.pathname.startsWith('/survey');
  const isLandingRoute = location.pathname === '/';

  // Show login for dashboard access
  if (isDashboardRoute && !isAuthenticated) {
    return (
      <Theme theme="g90">
      <Header aria-label="IBM Db2 Survey">
        <HeaderName href="/" prefix="IBM">
          Db2 Survey
        </HeaderName>
      </Header>
        <Content id="main-content">
          <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ padding: '0 2rem' }}>
              <LoginPage onLogin={handleLogin} error={loginError} />
            </div>
          </div>
        </Content>
      </Theme>
    );
  }

  return (
    <Theme theme="g90">
      <Header aria-label="IBM Db2 Survey">
        <HeaderName href="/" prefix="IBM">
          Db2 Survey
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User Avatar" tooltipAlignment="end">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav
        aria-label="Side navigation"
        expanded={false}
        onSideNavBlur={() => {}}
        href="#main-content"
        isFixedNav
        isChildOfHeader={false}
      >
        <SideNavItems>
          {isAuthenticated && (
            <SideNavLink 
              renderIcon={Dashboard}
              onClick={() => navigate('/dashboard')}
              isActive={isDashboardRoute}
            >
              Dashboard
            </SideNavLink>
          )}
        </SideNavItems>
      </SideNav>

      <Content id="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage
                problems={problems}
                currentConfig={config}
                onLaunchSurvey={(sessionId) => {
                  window.open(`/survey/${sessionId}`, '_blank');
                }}
                onConfigUpdate={() => {
                  reload();
                }}
                onReloadConfig={() => {
                  reload();
                }}
              />
            } 
          />
          <Route 
            path="/survey/:sessionId" 
            element={
              <SurveyRoute 
                problems={problems} 
                groupColors={groupColors} 
                config={config} 
              />
            } 
          />
        </Routes>
      </Content>
    </Theme>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
