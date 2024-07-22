import React, { useState } from 'react';
import { View, Image, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, list } from "firebase/storage";

// Initialize Firebase only once
const firebaseConfig = {
  apiKey: "AIzaSyCy2AJ2kO6tbQUKf3xvwsjtcjCQxn6D7pc",
  authDomain: "upimage-35941.firebaseapp.com",
  projectId: "upimage-35941",
  storageBucket: "upimage-35941.appspot.com",
  messagingSenderId: "85273044689",
  appId: "1:85273044689:web:162a94a9338a96526587f0"
};

const app = initializeApp(firebaseConfig);

const imageUp = () => {
  const [imageUri, setImageUri] = useState<string | null>("https://cdn.pixabay.com/photo/2014/08/20/09/04/frame-422371_640.png");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);  // Verifique a estrutura do resultado no console

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri ?? null); // Usa `null` se `uri` for indefinido
    }
  };

  function getRandom(max: number): number {
    return Math.floor(Math.random() * max + 1);
  }

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Selecione uma imagem antes de enviar.');
      return;
    }

    const storage = getStorage();
    const name = getRandom(200);
    const imageRef = ref(storage, `${name}.jpg`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    setUploading(true);
    uploadBytes(imageRef, blob).then((snapshot) => {
      console.log(snapshot);
      Alert.alert('Imagem enviada com sucesso!!');
      setUploading(false);
      setImageUri(null); // Limpar a imagem selecionada
    }).catch((error) => {
      console.error('Erro ao fazer upload:', error);
      setUploading(false);
    });
  };

  const LinkImage = async () => {
    const storage = getStorage();
    const listRef = ref(storage);

    const firstPage = await list(listRef, { maxResults: 100 });
    const lista = firstPage.items.map((item) => {
      return `https://firebasestorage.googleapis.com/v0/b/${item.bucket}/o/${encodeURIComponent(item.fullPath)}?alt=media`;
    });

    setImages(lista);
    setVisible(true);
    console.log(lista);
  };

  const deleteImage = async (imagePath: string) => {
    try {
      if (!imagePath.includes('/o/') || !imagePath.includes('?')) {
        throw new Error('URL da imagem malformada');
      }

      const pathSegments = imagePath.split('/o/');
      if (pathSegments.length < 2) {
        throw new Error('URL da imagem malformada');
      }

      const decodedPath = decodeURIComponent(pathSegments[1].split('?')[0]);
      const storage = getStorage();
      const imageRef = ref(storage, decodedPath);

      deleteObject(imageRef).then(() => {
        console.log('Arquivo deletado com sucesso');
        setImages(images.filter(img => img !== imagePath));
      }).catch((error) => {
        console.error('Erro ao deletar o arquivo!', error);
      });
    } catch (error) {
      console.error('Erro ao processar a URL da imagem:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.customButton, styles.customButton1]} onPress={pickImage}>
          <Text style={styles.buttonText}>Escolher Imagem</Text>
        </TouchableOpacity>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
        {uploading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity
            style={[styles.customButton, styles.customButton1, { marginTop: 10 }]}
            onPress={uploadImage}
            disabled={!imageUri}
          >
            <Text style={styles.buttonText}>Enviar Imagem</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.leftStart}>
        <TouchableOpacity style={[styles.customButton, styles.customButton1]} onPress={LinkImage}>
          <Text style={styles.buttonText}>Ver Imagens</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={[styles.leftStart]}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.imageItem, styles.leftStart]}>
            {item && (
              <>
                <Image source={{ uri: item }} style={styles.smallImage} />
                <TouchableOpacity style={[styles.customButton, styles.customButtonDeletar]} onPress={() => deleteImage(item)}>
                  <Text style={styles.buttonText}>Deletar Imagem</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 60,
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  leftStart: {
    alignSelf: "flex-start",
    margin: 30,
  },
  imageItem: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: 'center',
  },
  smallImage: {
    marginRight: 20,
    width: 100,
    height: 100,
  },
  customButton: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton1: {
    backgroundColor: 'blue',
  },
  customButtonDeletar: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: "600",
  },
});

export default imageUp;
