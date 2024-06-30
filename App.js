import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Modal, Image, ScrollView, SafeAreaView } from "react-native";
import { CameraView, Camera } from "expo-camera";
import axios from "axios";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned =  ({ data }) => {
    setScanned(true);
    if (data) {
      axios.get(`https://world.openfoodfacts.net/api/v2/product/${data}?cc=tr&lc=tr`)
        .then((response) => {
          setProductInfo(response.data.product);
          setModalVisible(true); 
        })
        .catch((err) => console.log(err));
    }
  };

  if (hasPermission === null) {
    return <Text>Kamera izni isteniyor</Text>;
  }
  if (hasPermission === false) {
    return <Text>Kameraya erişim yok</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tekrar taramak için dokunun"} onPress={() => setScanned(false)} />
      )}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{productInfo?.product_name}</Text>
            <Image
              source={{ uri: productInfo?.image_url }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>Marka: {productInfo?.product_name}</Text>
            <Text style={styles.modalText}>Kalori: {productInfo?.nutriments?.energy_value} kcal</Text>
          </ScrollView>
          <Button title="Kapat" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  productImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});
