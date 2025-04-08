import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from "react";
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

export default function HistoryPage() {
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [deletedDeliveryPersons, setDeletedDeliveryPersons] = useState<DeliveryPerson[]>([]);

  useEffect(() => {
    loadCompletedDeliveries();
    loadDeletedDeliveryPersons();
  }, []);

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

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryInfo}>
        <Text style={[
          styles.trackingNumber, 
          item.status === '삭제됨' && styles.deletedText
        ]}>운송장번호: {item.trackingNumber}</Text>
        <Text style={[
          styles.status, 
          item.status === '삭제됨' && styles.deletedText
        ]}>상태: {item.status}</Text>
        <Text style={[
          styles.destinationText, 
          item.status === '삭제됨' && styles.deletedText
        ]}>목적지: {item.destination}</Text>
        <Text style={[
          styles.departureText, 
          item.status === '삭제됨' && styles.deletedText
        ]}>출발지: {item.departure}</Text>
        <Text style={[
          styles.deliveryPersonText, 
          item.status === '삭제됨' && styles.deletedText
        ]}>배달원: {item.deliveryPerson}</Text>
        {item.completedAt && (
          <Text style={[
            styles.completedAtText, 
            item.status === '삭제됨' && styles.deletedText
          ]}>
            {item.status === '삭제됨' ? '삭제 시간' : '완료 시간'}: {new Date(item.completedAt).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderDeliveryPersonItem = ({ item }: { item: DeliveryPerson }) => (
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryInfo}>
        <Text style={[
          styles.deliveryPersonName,
          item.status === '삭제됨' && styles.deletedText
        ]}>배달원: {item.name}</Text>
        {item.deletedAt && (
          <Text style={[
            styles.completedAtText,
            item.status === '삭제됨' && styles.deletedText
          ]}>
            삭제 시간: {new Date(item.deletedAt).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>배송 히스토리</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.buttonText}>메인으로</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>삭제된 배달원</Text>
          <FlatList
            data={deletedDeliveryPersons}
            renderItem={renderDeliveryPersonItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>완료된 배송</Text>
          <FlatList
            data={completedDeliveries}
            renderItem={renderDeliveryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 10,
  },
  deliveryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
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
  destinationText: {
    fontSize: 14,
    color: '#666',
  },
  departureText: {
    fontSize: 14,
    color: '#666',
  },
  deliveryPersonText: {
    fontSize: 14,
    color: '#666',
  },
  completedAtText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deletedText: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
  deliveryPersonName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 