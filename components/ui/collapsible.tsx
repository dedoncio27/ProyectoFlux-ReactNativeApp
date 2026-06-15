import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  return (
    <List.Section>
      <List.Accordion title={title}>
        <View style={styles.content}>{children}</View>
      </List.Accordion>
    </List.Section>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
