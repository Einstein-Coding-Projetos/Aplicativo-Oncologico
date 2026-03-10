import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import api from '../lib/api';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    api.isAuthenticated().then((auth) => {
      setIsAuthenticated(auth);
      setLoading(false);
    });
  }, []);

  if (loading) return <View style={{ flex: 1 }} />;

  return <Redirect href={isAuthenticated ? '/(tabs)/diario' : '/(auth)/login'} />;
}
