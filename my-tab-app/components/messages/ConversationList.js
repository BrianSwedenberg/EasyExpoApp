import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';

const ConversationList = ({ 
  conversations, 
  loading, 
  onConversationPress,
  onRefresh
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'M/d/yy');
    }
  };

  const renderAvatar = (conversation) => {
    // This would need to be adjusted based on your data structure
    const participant = conversation.participants?.[0];
    
    if (participant?.avatar_url) {
      return (
        <Image 
          source={{ uri: participant.avatar_url }} 
          style={styles.avatar} 
        />
      );
    }
    
    return (
      <View style={[styles.avatar, styles.placeholderAvatar]}>
        <Text style={styles.avatarText}>
          {(participant?.name || 'User').charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => onConversationPress(item)}
    >
      {renderAvatar(item)}
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {item.title || item.participants?.[0]?.name || 'Unknown Contact'}
          </Text>
          <Text style={styles.timeText}>
            {formatDate(item.last_message_at || item.created_at)}
          </Text>
        </View>
        
        <Text style={styles.messagePreview} numberOfLines={1}>
          {item.last_message || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={['#0077cc']}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubText}>
            Start a new conversation by tapping the compose button
          </Text>
        </View>
      }
      contentContainerStyle={
        conversations.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
      }
    />
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  placeholderAvatar: {
    backgroundColor: '#0077cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#888',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConversationList;