import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.paragraph}>
        This is a simple React Native application built with Expo Go.
      </Text>
      <Text style={styles.paragraph}>
        It demonstrates how to create a multi-tab application with React Navigation.
      </Text>
      <Text style={styles.paragraph}>
        Feel free to modify and expand this template for your own project needs.
      </Text>
      <StatusBar style="auto" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AboutScreen;