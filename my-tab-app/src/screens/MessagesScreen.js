import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import ConversationList from '../components/messages/ConversationList';
import ConversationScreen from '../components/messages/ConversationScreen';
import { supabase } from '../lib/supabase';

const Stack = createStackNavigator();

const MessagesHomeScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription
    const subscription = supabase
      .channel('conversations-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations' 
      }, payload => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // This query would need to be adjusted based on your Supabase schema
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          title,
          last_message,
          last_message_at,
          participants:users(id, name, phone_number, avatar_url)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.newMessageButton}
          onPress={() => navigation.navigate('NewConversation')}
        >
          <Ionicons name="create-outline" size={24} color="#0077cc" />
        </TouchableOpacity>
      </View>
      
      <ConversationList 
        conversations={conversations}
        loading={loading}
        onConversationPress={(conversation) => {
          navigation.navigate('Conversation', { conversation });
        }}
        onRefresh={fetchConversations}
      />
      
      <StatusBar style="auto" />
    </View>
  );
};

const MessagesScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MessagesHome" 
        component={MessagesHomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Conversation" 
        component={ConversationScreen}
        options={({ route }) => ({ 
          title: route.params.conversation.title || 'Chat',
          headerBackTitleVisible: false
        })} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newMessageButton: {
    padding: 8,
  }
});

export default MessagesScreen;