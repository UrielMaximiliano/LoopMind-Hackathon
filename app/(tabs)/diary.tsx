import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PersonalDiary from '@/components/PersonalDiary';

export default function DiaryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <PersonalDiary />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 