import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble, SystemMessage, Send, InputToolbar } from 'react-native-gifted-chat';
import { db, auth } from '../../library/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, View, Text,  StyleSheet} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ChatParams {
  travelId: string;
  userId: string;
  creatorId: string;
  [key: string]: string;
}

const Chat: React.FC = () => {
  const params = useLocalSearchParams<ChatParams>();
  const { travelId, userId, creatorId } = params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [profilePictures, setProfilePictures] = useState<{ [key: string]: string }>({});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!travelId) return;

    const messagesRef = collection(db, 'travels', travelId, 'chats');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesFirestore = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const firebaseData = doc.data();
          const userProfile = await getProfilePicture(firebaseData.user._id);

          const data: IMessage = {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: new Date(firebaseData.createdAt.seconds * 1000),
            user: {
              ...firebaseData.user,
              avatar: userProfile,
            },
          };

          return data;
        })
      );

      setMessages(messagesFirestore);
    });

    return () => unsubscribe();
  }, [travelId]);

  const getProfilePicture = async (userId: string) => {
    if (profilePictures[userId]) return profilePictures[userId];
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const profilePicture = userData?.profilePicture || '@assets/adapative-icon2.png';
    setProfilePictures((prev) => ({ ...prev, [userId]: profilePicture }));
    return profilePicture;
  };

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    const { _id, createdAt, text, user } = messages[0];

    try {
      await addDoc(collection(db, 'travels', travelId, 'chats'), {
        _id,
        createdAt,
        text,
        user,
      });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  }, [travelId]);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: '#2A2C38',
            fontFamily: "CerebriSans-Book"
          },
          left: {
            color: '#2A2C38',
            fontFamily: "CerebriSans-Book"
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: '#9DD187',
            borderTopRightRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
            
          },
          left: {
            backgroundColor: '#FFFFFF',
            borderTopRightRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
          },
        }}
        timeTextStyle={{
          right: {
            color: 'black',
          },
          left: {
            color: 'black',
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
      {...props}
      containerStyle={styles.inputToolbarContainer}
      renderActions={() => (
        <View style={styles.actionContainer}>
          <Ionicons name="add" color="#9DD187" size={28} />
        </View>
      )}
      renderSend={(sendProps) => (
        <Send {...sendProps}>
          <View style={styles.sendContainer}>
            <Ionicons name="arrow-forward" color="#9DD187" size={28} />
          </View>
        </Send>
      )}
    />
    );
  };

  const renderAvatar = (props: any) => {
    const { currentMessage = {} } = props;
    const { user = {} } = currentMessage;
    const { avatar = 'https://www.example.com/default-avatar.png' } = user;
  
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
      />
    );
  };
  

  const image = { uri: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwallpapers.com%2Fwhite-screen-background&psig=AOvVaw22rHE-C1oqkdx2oaBr7xgF&ust=1721762469629000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCPCfhZWvu4cDFQAAAAAdAAAAABAQ' };

  return (
    <ImageBackground source={image} style={{
      flex: 1,
      marginBottom: insets.bottom,
    }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth.currentUser?.uid || '',
          name: auth.currentUser?.displayName || 'User',
        }}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderInputToolbar={renderInputToolbar}
        maxComposerHeight={100}
        textInputProps={styles.composer}
        bottomOffset={insets.bottom}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  composer: {
    backgroundColor: '#FFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFFFF',
    paddingHorizontal: 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    fontSize: 16,
    marginVertical: 4,
    height: 40,
  },
  inputToolbarContainer: {
    backgroundColor: "#edf5ee",
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingLeft: 5,
    paddingRight: 5,
    marginBottom: 10,
  },
  actionContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
   sendContainer: {
    height: 50,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default Chat;
