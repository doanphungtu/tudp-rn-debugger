import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getRequests, clearRequests } from '../infrastructure/NetworkInterceptor';

const NetworkDebugger: React.FC = () => {
  const [data, setData] = React.useState(getRequests());

  React.useEffect(() => {
    const id = setInterval(() => {
      setData(getRequests());
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Network Debugger</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.method}>{item.method} {item.url}</Text>
            <Text>Status: {item.status ?? '-'}</Text>
            <Text>Duration: {item.duration ?? 0} ms</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text onPress={() => { clearRequests(); setData([]); }} style={styles.clear}>Clear</Text>
      </View>
    </View>
  );
};

export default NetworkDebugger;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  item: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  method: { fontWeight: '600' },
  footer: { padding: 8, alignItems: 'center' },
  clear: { color: 'blue' }
});
