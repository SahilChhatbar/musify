// App.tsx
import { Text, Button, Container, Stack, Box } from '@mantine/core';
import { AppShellLayout } from './layout/AppShellLayout';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';

const App: React.FC = () => {
  const { 
    profile, 
    loading, 
    login: handleLogin, 
    logout,
    isAuthenticated
  } = useSpotifyAuth();
  
  if (loading) {
    return (
      <Container>
        <Stack align="center" justify="center" style={{ height: '100vh' }}>
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AppShellLayout
          profile={profile}
          onLogout={logout}
        >
          <Container>
            <Text size="xl">Welcome to your Spotify Dashboard</Text>
            {profile && (
              <Box mt="md">
                <Text>Logged in as: {profile.display_name}</Text>
                {profile.images && profile.images[0] && (
                  <Box 
                    component="img" 
                    src={profile.images[0].url} 
                    alt="Profile" 
                    style={{ width: 100, height: 100, borderRadius: '50%', marginTop: 10 }}
                  />
                )}
              </Box>
            )}
          </Container>
        </AppShellLayout>
      ) : (
        <Container>
          <Stack align="center" justify="center" style={{ height: '100vh' }}>
            <Text size="xl">Welcome to Spotify Clone</Text>
            <Button onClick={handleLogin} size="lg">
              Connect with Spotify
            </Button>
          </Stack>
        </Container>
      )}
    </>
  );
};

export default App;
