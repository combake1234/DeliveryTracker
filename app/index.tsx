import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from "react";
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Delivery {
  id: string;
  trackingNumber: string;
  status: '대기중' | '출발' | '도착' | '삭제됨';
  destination: string;
  departure: string;
  deliveryPerson: string;
  completedAt?: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  status?: '활성' | '삭제됨';
  deletedAt?: string;
}

export default function Page() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [deletedDeliveryPersons, setDeletedDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryPersonModalVisible, setDeliveryPersonModalVisible] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    trackingNumber: '',
    destination: '',
    departure: '',
    deliveryPerson: '',
  });
  const [newDeliveryPerson, setNewDeliveryPerson] = useState('');

  // 배달원 정보 로드
  useEffect(() => {
    loadDeliveryPersons();
  }, []);

  // 배달원 정보 저장
  const saveDeliveryPersons = async (persons: DeliveryPerson[]) => {
    try {
      await AsyncStorage.setItem('deliveryPersons', JSON.stringify(persons));
    } catch (error) {
      console.error('Failed to save delivery persons:', error);
    }
  };

  // 배달원 정보 로드
  const loadDeliveryPersons = async () => {
    try {
      const savedPersons = await AsyncStorage.getItem('deliveryPersons');
      if (savedPersons) {
        setDeliveryPersons(JSON.parse(savedPersons));
      }
    } catch (error) {
      console.error('Failed to load delivery persons:', error);
    }
  };

  // 삭제된 배달원 정보 저장
  const saveDeletedDeliveryPersons = async (deletedPersons: DeliveryPerson[]) => {
    try {
      await AsyncStorage.setItem('deletedDeliveryPersons', JSON.stringify(deletedPersons));
    } catch (error) {
      console.error('Failed to save deleted delivery persons:', error);
    }
  };

  // 삭제된 배달원 정보 로드
  const loadDeletedDeliveryPersons = async () => {
    try {
      const savedDeletedPersons = await AsyncStorage.getItem('deletedDeliveryPersons');
      if (savedDeletedPersons) {
        setDeletedDeliveryPersons(JSON.parse(savedDeletedPersons));
      }
    } catch (error) {
      console.error('Failed to load deleted delivery persons:', error);
    }
  };

  const addDeliveryPerson = () => {
    if (!newDeliveryPerson) {
      Alert.alert('오류', '배달원 이름을 입력해주세요.');
      return;
    }

    const deliveryPerson: DeliveryPerson = {
      id: Date.now().toString(),
      name: newDeliveryPerson,
    };

    const updatedPersons = [...deliveryPersons, deliveryPerson];
    setDeliveryPersons(updatedPersons);
    saveDeliveryPersons(updatedPersons);
    setDeliveryPersonModalVisible(false);
    setNewDeliveryPerson('');
  };

  // 배달원 삭제 함수
  const deleteDeliveryPerson = async (id: string) => {
    Alert.alert(
      '배달원 삭제',
      '이 배달원을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 현재 배달원 목록에서 제거
              const updatedPersons = deliveryPersons.filter(p => p.id !== id);
              setDeliveryPersons(updatedPersons);
              await saveDeliveryPersons(updatedPersons);
              
              Alert.alert('알림', '배달원이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to delete delivery person:', error);
              Alert.alert('오류', '배달원 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 배송 정보 저장
  const saveDeliveries = async (deliveries: Delivery[]) => {
    try {
      const deliveriesString = JSON.stringify(deliveries);
      await AsyncStorage.setItem('deliveries', deliveriesString);
    } catch (error) {
      console.error('Failed to save deliveries:', error);
      throw error;
    }
  };

  // 배송 정보 로드
  const loadDeliveries = async () => {
    try {
      const savedDeliveries = await AsyncStorage.getItem('deliveries');
      if (savedDeliveries) {
        setDeliveries(JSON.parse(savedDeliveries));
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  // 완료된 배송 정보 저장
  const saveCompletedDeliveries = async (completedDeliveries: Delivery[]) => {
    try {
      const completedDeliveriesString = JSON.stringify(completedDeliveries);
      await AsyncStorage.setItem('completedDeliveries', completedDeliveriesString);
    } catch (error) {
      console.error('Failed to save completed deliveries:', error);
      throw error;
    }
  };

  // 완료된 배송 정보 로드
  const loadCompletedDeliveries = async () => {
    try {
      const savedCompletedDeliveries = await AsyncStorage.getItem('completedDeliveries');
      if (savedCompletedDeliveries) {
        setCompletedDeliveries(JSON.parse(savedCompletedDeliveries));
      }
    } catch (error) {
      console.error('Failed to load completed deliveries:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadDeliveryPersons();
    loadDeliveries();
    loadCompletedDeliveries();
    loadDeletedDeliveryPersons();
  }, []);

  const addDelivery = () => {
    if (!newDelivery.trackingNumber || !newDelivery.destination || !newDelivery.departure || !newDelivery.deliveryPerson) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    const delivery: Delivery = {
      id: Date.now().toString(),
      ...newDelivery,
      status: '대기중'
    };

    const updatedDeliveries = [...deliveries, delivery];
    setDeliveries(updatedDeliveries);
    saveDeliveries(updatedDeliveries);
    setModalVisible(false);
    setNewDelivery({ trackingNumber: '', destination: '', departure: '', deliveryPerson: '' });
  };

  const updateStatus = (id: string, newStatus: Delivery['status']) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === id) {
        if (newStatus === '도착') {
          const completedDelivery: Delivery = { 
            ...delivery, 
            status: '도착', 
            completedAt: new Date().toISOString() 
          };
          const updatedCompletedDeliveries = [...completedDeliveries, completedDelivery];
          setCompletedDeliveries(updatedCompletedDeliveries);
          saveCompletedDeliveries(updatedCompletedDeliveries);
          return null;
        }
        return { ...delivery, status: newStatus };
      }
      return delivery;
    }).filter((delivery): delivery is Delivery => delivery !== null);

    setDeliveries(updatedDeliveries);
    saveDeliveries(updatedDeliveries);
  };

  const deleteDelivery = async (id: string) => {
    Alert.alert(
      '배송 삭제',
      '이 배송을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 현재 배송 목록에서 삭제
              const updatedDeliveries = deliveries.filter(delivery => delivery.id !== id);
              await saveDeliveries(updatedDeliveries);
              setDeliveries(updatedDeliveries);

              // 완료된 배송 목록에서도 삭제
              const updatedCompletedDeliveries = completedDeliveries.filter(delivery => delivery.id !== id);
              await saveCompletedDeliveries(updatedCompletedDeliveries);
              setCompletedDeliveries(updatedCompletedDeliveries);

              Alert.alert('알림', '배송이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to delete delivery:', error);
              Alert.alert('오류', '배송 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryInfo}>
        <Text style={styles.trackingNumber}>운송장번호: {item.trackingNumber}</Text>
        <Text style={styles.status}>상태: {item.status}</Text>
        <Text style={styles.destination}>목적지: {item.destination}</Text>
        <Text style={styles.departure}>출발지: {item.departure}</Text>
        <Text style={styles.deliveryPerson}>배달원: {item.deliveryPerson}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {item.status === '대기중' && (
          <TouchableOpacity
            style={styles.departButton}
            onPress={() => updateStatus(item.id, '출발')}
          >
            <Text style={styles.buttonText}>출발</Text>
          </TouchableOpacity>
        )}
        {item.status === '출발' && (
          <TouchableOpacity
            style={styles.arriveButton}
            onPress={() => updateStatus(item.id, '도착')}
          >
            <Text style={styles.buttonText}>도착</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            const deletedDelivery: Delivery = { 
              ...item, 
              status: '삭제됨', 
              completedAt: new Date().toISOString() 
            };
            
            // 현재 배송 목록에서 제거
            const newDeliveries = deliveries.filter(d => d.id !== item.id);
            setDeliveries(newDeliveries);
            saveDeliveries(newDeliveries);
            
            // 완료된 배송 목록에 추가
            const updatedCompletedDeliveries = [...completedDeliveries, deletedDelivery];
            setCompletedDeliveries(updatedCompletedDeliveries);
            saveCompletedDeliveries(updatedCompletedDeliveries);
            
            Alert.alert('알림', '배송이 삭제되어 히스토리로 이동되었습니다.');
          }}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 모달을 닫을 때 입력된 정보 초기화
  const handleCloseModal = () => {
    setModalVisible(false);
    setNewDelivery({
      trackingNumber: '',
      destination: '',
      departure: '',
      deliveryPerson: '',
    });
  };

  const handleCloseDeliveryPersonModal = () => {
    setDeliveryPersonModalVisible(false);
    setNewDeliveryPerson('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>배송 추적</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => setDeliveryPersonModalVisible(true)}
          >
            <Text style={styles.buttonText}>+ 배달원 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>+ 새 배송 추가</Text>
          </TouchableOpacity>
          <Link 
            href={{
              pathname: "/history",
              params: { completedDeliveries: JSON.stringify(completedDeliveries) }
            }}
            asChild
          >
            <View>
              <TouchableOpacity style={[styles.button, styles.historyButton]}>
                <Text style={styles.buttonText}>히스토리</Text>
              </TouchableOpacity>
            </View>
          </Link>
        </View>
      </View>

      <FlatList
        data={deliveries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 배송 추가</Text>
            <TextInput
              style={styles.input}
              placeholder="운송장번호"
              value={newDelivery.trackingNumber}
              onChangeText={text => setNewDelivery({ ...newDelivery, trackingNumber: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="출발지"
              value={newDelivery.departure}
              onChangeText={text => setNewDelivery({ ...newDelivery, departure: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="목적지"
              value={newDelivery.destination}
              onChangeText={text => setNewDelivery({ ...newDelivery, destination: text })}
            />
            <Picker
              selectedValue={newDelivery.deliveryPerson}
              onValueChange={(itemValue) => setNewDelivery({ ...newDelivery, deliveryPerson: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="배달원 선택" value="" />
              {deliveryPersons.map(person => (
                <Picker.Item key={person.id} label={person.name} value={person.name} />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={addDelivery}
              >
                <Text style={styles.buttonText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deliveryPersonModalVisible}
        onRequestClose={handleCloseDeliveryPersonModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>배달원 관리</Text>
            <TextInput
              style={styles.input}
              placeholder="배달원 이름"
              value={newDeliveryPerson}
              onChangeText={setNewDeliveryPerson}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseDeliveryPersonModal}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addDeliveryPerson}
              >
                <Text style={styles.buttonText}>추가</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deliveryPersonsList}>
              <Text style={styles.deliveryPersonsTitle}>등록된 배달원</Text>
              {deliveryPersons.map(person => (
                <View key={person.id} style={styles.deliveryPersonItem}>
                  <Text style={styles.deliveryPersonName}>{person.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteDeliveryPerson(person.id)}
                  >
                    <Text style={styles.buttonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  historyButton: {
    backgroundColor: '#2196F3',
  },
  departButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  arriveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  list: {
    flex: 1,
  },
  deliveryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
  destination: {
    fontSize: 14,
    color: '#666',
  },
  departure: {
    fontSize: 14,
    color: '#666',
  },
  deliveryPerson: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  deliveryPersonsList: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  deliveryPersonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deliveryPersonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deliveryPersonName: {
    fontSize: 14,
  },
});
