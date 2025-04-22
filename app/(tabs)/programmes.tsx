import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

type Programme = {
  id: string;
  name: string;
  description: string;
  workoutCount: number;
  imageUrl: string;
};

const sampleProgrammes: Programme[] = [
  {
    id: '1',
    name: 'Strength Builder',
    description: 'Progressive overload focused strength training',
    workoutCount: 3,
    imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'
  },
  {
    id: '2',
    name: 'Endurance Plus',
    description: 'High-volume endurance training',
    workoutCount: 4,
    imageUrl: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg'
  }
];

export default function ProgrammesScreen() {
  const [programmes, setProgrammes] = useState<Programme[]>(sampleProgrammes);

  const renderProgrammeItem = ({ item }: { item: Programme }) => (
    <TouchableOpacity 
      style={styles.programmeCard}
      onPress={() => router.push('/workout')}
    >
      <Image 
        source={{ uri: item.imageUrl }}
        style={styles.programmeImage}
      />
      <View style={styles.programmeContent}>
        <View style={styles.programmeHeader}>
          <Text style={styles.programmeName}>{item.name}</Text>
          <ChevronRight size={20} color={Colors.text.secondary} />
        </View>
        <Text style={styles.programmeDescription}>{item.description}</Text>
        <Text style={styles.workoutCount}>{item.workoutCount} workouts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Programmes</Text>
      
      <FlatList
        data={programmes}
        renderItem={renderProgrammeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>New Programme</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  list: {
    paddingBottom: 100,
  },
  programmeCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  programmeImage: {
    width: '100%',
    height: 160,
  },
  programmeContent: {
    padding: 16,
  },
  programmeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programmeName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
  },
  programmeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  workoutCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});