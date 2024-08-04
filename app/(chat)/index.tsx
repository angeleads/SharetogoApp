import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { db, auth } from '../../library/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/app';
import 'firebase/storage'; 

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
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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

  const pickImageasync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
   
    let imgURI = null;
    const hasStoragePermissionGranted = status === "granted";
   
   if(!hasStoragePermissionGranted) return null;
   
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
   
    if (!result.cancelled) {
      imgURI = result.uri;
    }
   
    return imgURI;
   };

   const uploadImageToStorage= async (imgURI ) => {
    const ref = `messages/${[FILE_REFERENCE_HERE]}`
  
    const imgRef = firebase.storage().ref(ref);
  
    const metadata = { contentType: "image/jpg" };
    
  
    // Fetch image data as BLOB from device file manager 
  
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imgURI, true);
      xhr.send(null);
    });

    const  localImgURI = "file://path_to_file" // Replace with real path of uploaded image
    const imgPermanentURL = await uploadImageToStorage(localImgURI)
    firestore().collection('chatrooms')
        .doc(docid)
        .collection('messages')
        .doc(messageId).update({image:imgPermanentURL})
  
    // Put image Blob data to firebase servers
    await imgRef.put(blob, metadata);
  
    // We're done with the blob, close and release it
    blob.close();
  
    // Image permanent URL
    const url = await imgRef.getDownloadURL();
  
   
    return url
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
    // Determine if the current message is the last message
    const isLastMessage = props.currentMessage && props.currentMessage._id === messages[0]?._id;

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
            marginBottom: isLastMessage ? 20 : 0, // Apply marginBottom only to the last message
          },
          left: {
            backgroundColor: '#FFFFFF',
            borderTopRightRadius: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
            marginBottom: isLastMessage ? 20 : 0, // Apply marginBottom only to the last message
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
            <Ionicons name="add" color="#9DD187" size={30} onPress={pickImageasync} />
          </View>
        )}
        renderSend={(sendProps) => (
          <Send {...sendProps}>
            <View style={styles.sendContainer}>
              <Ionicons name="send" color="#9DD187" size={25} />
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
      marginBottom: '13%',
    }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9DD187" />
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: auth.currentUser?.uid || '',
            name: auth.currentUser?.displayName || 'user',
          }}
          renderBubble={renderBubble}
          renderAvatar={renderAvatar}
          renderUsernameOnMessage={true}
          renderInputToolbar={renderInputToolbar}
          maxComposerHeight={100}
          textInputProps={{ ...styles.composer }}
          bottomOffset={insets.bottom}
        />
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  inputToolbarContainer: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 3,
    marginTop: 5,
    shadowOffset: { width: 0, height: -9 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 14,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: 'transparent',
  },
  composer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    flex: 1,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat;
