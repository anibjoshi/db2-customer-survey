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
import { ResultsRoute } from './routes/ResultsRoute';
import './App.css';

function AppShell() {
  const { config, problems, groupColors, loading, error } = useSurveyConfig();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Theme theme="g90">
        <Header aria-label="Zora Survey">
          <HeaderName href="/" prefix="IBM">
            Zora Survey
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
        <Header aria-label="Zora Survey">
          <HeaderName href="/" prefix="IBM">
            Zora Survey
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

  const isSurveyRoute = location.pathname === '/survey' || location.pathname === '/';
  const isResultsRoute = location.pathname === '/results';

  return (
    <Theme theme="g90">
      <Header aria-label="Zora Survey">
        <HeaderName href="/survey" prefix="IBM">
          Zora Survey
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
          <SideNavLink 
            renderIcon={Dashboard}
            onClick={() => navigate('/survey')}
            isActive={isSurveyRoute}
          >
            Take Survey
          </SideNavLink>
          <SideNavLink 
            renderIcon={ChartScatter}
            onClick={() => navigate('/results')}
            isActive={isResultsRoute}
          >
            View Results
          </SideNavLink>
        </SideNavItems>
      </SideNav>

      <Content id="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <SurveyRoute 
                problems={problems} 
                groupColors={groupColors} 
                config={config} 
              />
            } 
          />
          <Route 
            path="/survey" 
            element={
              <SurveyRoute 
                problems={problems} 
                groupColors={groupColors} 
                config={config} 
              />
            } 
          />
          <Route 
            path="/results" 
            element={<ResultsRoute problems={problems} />} 
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
