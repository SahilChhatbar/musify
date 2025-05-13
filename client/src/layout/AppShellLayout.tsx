import React, { useState } from 'react';
import { 
  AppShell, 
  Burger, 
  Group, 
  Text, 
  UnstyledButton, 
  rem, 
  Box, 
  Button, 
  Divider, 
  NavLink
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconHome2, 
  IconSearch, 
  IconPlaylist, 
  IconHeartFilled, 
  IconDeviceSpeaker 
} from '@tabler/icons-react';

interface AppShellLayoutProps {
  children: React.ReactNode;
  profile: any;
  onLogout: () => void;
}

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({ 
  children, 
  profile, 
  onLogout 
}) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 250, 
        breakpoint: 'sm', 
        collapsed: { mobile: !opened } 
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={700} c="green">Spotify Clone</Text>
          </Group>
          <Group>
            {profile && (
              <Group>
                <Text size="sm">{profile.display_name}</Text>
                <Button variant="light" onClick={onLogout} size="xs">
                  Logout
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
          <NavLink
            label="Home"
            leftSection={<IconHome2 size={16} />}
            active
          />
          <NavLink
            label="Search"
            leftSection={<IconSearch size={16} />}
          />
          <NavLink
            label="Your Library"
            leftSection={<IconPlaylist size={16} />}
          />
          
          <Divider my="sm" />
          
          <NavLink
            label="Create Playlist"
            leftSection={<IconPlaylist size={16} />}
          />
          <NavLink
            label="Liked Songs"
            leftSection={<IconHeartFilled size={16} />}
          />
          
          <Divider my="sm" />
          
          <Text size="xs" fw={500} c="dimmed" mb="xs">PLAYLISTS</Text>
          
          {/* This would be populated from the user's playlists */}
          <NavLink
            label="My Playlist #1"
            disabled
          />
          <NavLink
            label="My Playlist #2"
            disabled
          />
          
          <Box mt="auto" pt="xl">
            <NavLink
              label="Install App"
              leftSection={<IconDeviceSpeaker size={16} />}
            />
          </Box>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};