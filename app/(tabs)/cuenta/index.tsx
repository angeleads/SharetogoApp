import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, RefreshControl, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../../../library/firebase';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { manipulateAsync } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';

export default function Cuenta() {
  const navigation = useNavigation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [editor, setEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorChanges, setErrorChanges] = useState('');


  const openURLWeb = async () => {
    const url = 'https://www.sharetogo.org';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  };

  const openURLPrivacy = async () => {
    const url = 'https://www.sharetogo.org/privacy';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }

  interface UserData {
    name: string;
    lastName: string;
    emailAdress: string;
    phoneNumber: string;
    profilePicture: string;
  }
  
  const updateUsersData = (userData: UserData) => {
    const { name, lastName, emailAdress, phoneNumber, profilePicture } = userData;
    if (
      name !== tempName ||
      lastName !== tempLastName ||
      emailAdress !== tempEmail ||
      phoneNumber !== tempPhone) {
      setName(name);
      setLastName(lastName);
      setEmail(emailAdress);
      setPhone(phoneNumber);
      setTempName(name);
      setTempLastName(lastName);
      setTempEmail(emailAdress);
      setTempPhone(phoneNumber);
      setSelectedImage(profilePicture);
    }
  };;

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser || null;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            updateUsersData(userData);
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

  
    fetchUserData();
  }, []);
  
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const user = auth.currentUser;
  
      if (user) {
        const docRef = doc(collection(db, 'users'), user.uid);
        const docSnapshot = await getDoc(docRef);
  
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          updateUsersData(userData);
        }
      }
    } catch (error) {
      console.error('onRefresh Error fetching user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        const manipulatedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500 } }],
          { compress: 0.7, format: 'jpeg', base64: false }
        );

        const user = auth.currentUser;
        const imageFileName = `profile_images/${user?.uid}_${Date.now()}.jpg`;
        const storageRef = ref(storage);
        const imageRef = ref(storageRef, imageFileName);
  
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
  
        const responseManipulated = await fetch(manipulatedImage.uri);
        const blobManipulated = await responseManipulated.blob();
  
        await uploadBytes(imageRef, blobManipulated);
        
        const docRef = doc(collection(db, 'users'), user?.uid);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const previousImageURL = userData.profilePicture;  
          if (previousImageURL) {
            const previousImageRef = ref(storage, previousImageURL);
            await deleteObject(previousImageRef);
          }
        }  
        const imageUrl = await getDownloadURL(imageRef);
        setSelectedImage(imageUrl);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleInputChange = async () => {
    if (tempEmail == '' || tempLastName == '' || tempName == '' || tempPhone == '')
    {
      setErrorChanges("ERROR: Falta información por completar");
      return;
    }
    setErrorChanges("");
    setIsSaving(true);
    const user = auth.currentUser;
  
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userRef);
  
        if (userDocSnapshot.exists()) {
          const userDoc = userDocSnapshot.data();
  
          const updateData = {};
  
          if (selectedImage && selectedImage !== userDoc.profilePicture) {
            updateData.profilePicture = selectedImage;
          }
          if (tempName !== userDoc.name) {
            updateData.name = tempName;
          }
          if (tempLastName !== userDoc.lastName) {
            updateData.lastName = tempLastName;
          }
          if (tempEmail !== userDoc.emailAdress) {
            updateData.emailAdress = tempEmail;
          }
          if (tempPhone !== userDoc.phoneNumber) {
            updateData.phoneNumber = tempPhone;
          }
  
          if (Object.keys(updateData).length > 0) {
            await updateDoc(userRef, updateData);
            setName(tempName);
            setLastName(tempLastName);
            setEmail(tempEmail);
            setPhone(tempPhone);
            setEditor(false);
            console.log('User data updated successfully.');
          } else {
            console.log('No changes in user data.');
          }
        } else {
          console.error('User document not found.');
        }
      } catch (error) {
        console.error('Error updating user data:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  
  const handleOpenEdit = () => {
    if (!editor) {
      setEditor(true);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.navigate('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={editor? handleSelectImage: null}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.profileImage} />
          ) : (
            <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/share-to-go-db.appspot.com/o/profile_images%2FsharetoGo_greenBG.png?alt=media&token=b29e55b9-ce79-4720-be5a-d29ed46bb9e3" }} style={styles.profileImage} />
          )}
          </TouchableOpacity>
            {editor ? (
              <TextInput value={tempName} placeholderTextColor="#888888" placeholder="Nombre" onChangeText={(text) => setTempName(text)} style={styles.title} />
            ) : (
              <Text style={styles.title}>¡Hola, {name}!</Text>
            )}
        </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Apellido</Text>
                {editor ? (
                  <TextInput value={tempLastName} placeholderTextColor="#888888" placeholder="Apellido" onChangeText={(text) => setTempLastName(text)} style={styles.input} />
                ) : (
                  <Text style={styles.info}>{lastName}</Text>
                )}
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                {editor ? (
                  <TextInput value={tempEmail} placeholderTextColor="#888888" placeholder="Email" onChangeText={(text) => setTempEmail(text)} style={styles.input} />
                ) : (
                  <Text style={styles.info}>{email}</Text>
                )}
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Teléfono</Text>
                {editor ? (
                  <TextInput value={tempPhone} placeholderTextColor="#888888" placeholder="Número de teléfono" keyboardType='numeric' onChangeText={(text) => setTempPhone(text)} style={styles.input} />
                ) : (
                  <Text style={styles.info}>{phone}</Text>
                )}
              </View>
                <Text style={styles.textError}>{errorChanges}</Text>
            </View>
            <View style={styles.buttonContainer}>
              {editor ? (
                <TouchableOpacity style={styles.saveButton} onPress={handleInputChange}>
                  <Text style={styles.buttonText}>
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Text> 
               </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.editButton} onPress={handleOpenEdit}>
                  <Text style={styles.buttonText}>Editar perfil</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.listContainer}>
              <TouchableOpacity style={styles.listItem}>
                <Icon name="users" size={30} color="#2A2C38" style={styles.icon} />
                <Text style={styles.listText}>Centro de trabajo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.listItem} onPress={openURLWeb}>
                <Icon name="rocket" size={30} color="#2A2C38" style={styles.icon} />
                <Text style={styles.listText}>Sitio web</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.listItem} onPress={openURLPrivacy}>
                <Icon name="institution" size={30} color="#2A2C38" style={styles.icon} />
                <Text style={styles.listText}>Política de privacidad</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A2C38',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#2A2C38',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 18,
    color: '#6A6D7E',
  },
  input: {
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    color: '#2A2C38',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: {
    marginRight: 50,
  },
  listText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A2C38',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2A2C38',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF5733',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  textError: {
    color: 'red',
    paddingTop: 5,
  }
});