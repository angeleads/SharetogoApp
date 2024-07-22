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
    const profilePicture = userData?.profilePicture || '';
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

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#84c45c',
          },
          left: {
            backgroundColor: '#b8ccab',
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{ backgroundColor: "#edf5ee" }}
        renderActions={() => (
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center', left: 5 }}>
            <Ionicons name="add" color="84c45c" size={28} />
          </View>
        )}
      />
    );
  };

  const renderAvatar = (props) => {
    const { currentMessage } = props;
    return (
      <Image
        source={{ uri: currentMessage.user.avatar }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
      />
    );
  };

  const image = { uri: 'https://i.pinimg.com/originals/16/25/4b/16254b8e0cfcc9ebec4341e4709e5069.jpg' };

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
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#84c45c',
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 16,
    marginVertical: 4,
  },
});


export default Chat;
