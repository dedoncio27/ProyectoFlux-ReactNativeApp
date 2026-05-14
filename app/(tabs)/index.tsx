import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [sexo, setSexo] = useState('');
  const [actividad, setActividad] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState('');

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Principal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Altura (cm)</Text>
            <TextInput
              style={styles.input}
              value={altura}
              onChangeText={setAltura}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Peso (Kg)</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Edad</Text>
            <TextInput
              style={styles.input}
              value={edad}
              onChangeText={setEdad}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Sexo</Text>
            <View style={styles.select}>
              <Picker
                selectedValue={sexo}
                onValueChange={(itemValue) => setSexo(itemValue)}
                style={styles.picker}
                dropdownIconColor="#5e5e5e">
                <Picker.Item label="Hombre" value="hombre" />
                <Picker.Item label="Mujer" value="mujer" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Actividad</Text>
            <View style={styles.select}>
              <Picker
                selectedValue={actividad}
                onValueChange={(itemValue) => setActividad(itemValue)}
                style={styles.picker}
                dropdownIconColor="#5e5e5e">
                <Picker.Item label="Actividad baja" value="baja" />
                <Picker.Item label="Actividad media" value="media" />
                <Picker.Item label="Actividad alta" value="alta" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Objetivo</Text>
            <View style={styles.select}>
              <Picker
                selectedValue={objetivo}
                onValueChange={(itemValue) => setObjetivo(itemValue)}
                style={styles.picker}
                dropdownIconColor="#5e5e5e">
                <Picker.Item label="Perder peso" value="perder" />
                <Picker.Item label="Mantener peso" value="mantener" />
                <Picker.Item label="Subir de peso lentamente" value="subir_lento" />
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Guardar datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#1565c0',
    paddingTop: 56,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 70,
    paddingTop: 70,
    paddingBottom: 32,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    zIndex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 6,
    fontSize: 16,
    color: '#5a5a5a',
  },
  label: {
    fontSize: 16,
    color: '#5a5a5a',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#a8a8a8',
    borderRadius: 6,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 14,
    fontSize: 18123,
    color: '#2f2f2f',
  },
  select: {
    height: 56,
    borderWidth: 1,
    borderColor: '#a8a8a8',
    borderRadius: 6,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    color: '#2f2f2f',
  },
  saveButton: {
    marginTop: 18,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});
