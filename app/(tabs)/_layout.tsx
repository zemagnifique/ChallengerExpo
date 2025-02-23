import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const { isAuthenticated, challenges, getUnreadMessageCount } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol size={28} name="flame.fill" color={color} />
              {(challenges.reduce((sum, challenge) => 
                sum + getUnreadMessageCount(challenge.id), 0) + 
                challenges.filter(c => c.status === 'pending').length) > 0 && (
                <View style={{
                  backgroundColor: '#FF3B30',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: -8,
                  right: -12,
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {challenges.reduce((sum, challenge) => 
                      sum + getUnreadMessageCount(challenge.id), 0) + 
                      challenges.filter(c => c.status === 'pending').length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create-challenge"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}