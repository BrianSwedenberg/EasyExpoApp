import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const MessageBubble = ({ message, isCurrentUser }) => {
  const formattedTime = format(new Date(message.created_at), 'h:mm a');
  
  return (
    <View style={[
      styles.messageBubbleContainer,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.content}
        </Text>
        
        <Text style={[
          styles.timeText,
          isCurrentUser ? styles.currentUserTimeText : styles.otherUserTimeText
        ]}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

const ConversationScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    getCurrentUser();
    fetchMessages();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversation.id]);

  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      setCurrentUser(data.user);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch messages for this conversation
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentUser || sending) return;
    
    try {
      setSending(true);
      
      // Get the recipient's phone number
      const recipient = conversation.participants?.[0]?.phone_number;
      
      if (!recipient) {
        throw new Error('No recipient found for this conversation');
      }
      
      // Insert the message into Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          recipient_phone: recipient,
          content: messageText.trim(),
          status: 'sending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Clear the input field
      setMessageText('');
      
      // Trigger a serverless function to send SMS via Telnyx
      // This would need to be implemented in your Supabase backend
      await fetch('https://your-supabase-url.functions.supabase.co/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({
          message_id: data.id,
          recipient_phone: recipient,
          content: messageText.trim()
        })
      });
      
    } catch (error) {
      console.error('Error sending message:', error.message);
      // You might want to show an error toast/alert here
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.sender_id === currentUser?.id;
    return <MessageBubble message={item} isCurrentUser={isCurrentUser} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077cc" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messagesContainer}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) ? styles.sendButtonDisabled : {}
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubbleContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: '#0077cc',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimeText: {
    color: '#8E8E93',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#0077cc',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});

export default ConversationScreen;