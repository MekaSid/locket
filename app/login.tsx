import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '../src/components/AppText';
import { Button } from '../src/components/Button';
import { Screen } from '../src/components/Screen';
import { TextField } from '../src/components/TextField';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { useAuth } from '../src/providers/AuthProvider';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title = mode === 'signIn' ? 'Welcome back' : 'Create your account';
  const actionLabel = mode === 'signIn' ? 'Sign in' : 'Sign up';

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const result =
      mode === 'signIn'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, firstName.trim(), lastName.trim());

    if (result.error) {
      setError(result.error);
    } else if (result.message) {
      setMessage(result.message);
    }

    setSubmitting(false);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <AppText variant="eyebrow">Locket</AppText>
          <AppText variant="title">{title}</AppText>
          <AppText variant="body" color="muted">
            A private place for photos, prompts, and games.
          </AppText>
        </View>

        {!isSupabaseConfigured ? (
          <View style={styles.notice}>
            <AppText variant="subtitle">Supabase env needed</AppText>
            <AppText variant="body" color="muted">
              Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a local .env file,
              then restart Expo.
            </AppText>
          </View>
        ) : null}

        <View style={styles.form}>
          {mode === 'signUp' ? (
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <TextField
                  autoCapitalize="words"
                  autoComplete="given-name"
                  label="First name"
                  onChangeText={setFirstName}
                  placeholder="Sid"
                  textContentType="givenName"
                  value={firstName}
                />
              </View>
              <View style={styles.nameField}>
                <TextField
                  autoCapitalize="words"
                  autoComplete="family-name"
                  label="Last name"
                  onChangeText={setLastName}
                  placeholder="Meka"
                  textContentType="familyName"
                  value={lastName}
                />
              </View>
            </View>
          ) : null}

          <TextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={email}
          />
          <TextField
            autoCapitalize="none"
            autoComplete="password"
            label="Password"
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
            value={password}
          />

          {error ? <AppText color="danger">{error}</AppText> : null}
          {message ? <AppText color="success">{message}</AppText> : null}

          <Button disabled={!isSupabaseConfigured || submitting} loading={submitting} onPress={handleSubmit}>
            {actionLabel}
          </Button>
          <Button
            disabled={submitting}
            onPress={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setError(null);
              setMessage(null);
            }}
            variant="ghost"
          >
            {mode === 'signIn' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  header: {
    gap: 10,
  },
  notice: {
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f7f7f7',
    padding: 14,
    gap: 6,
  },
  form: {
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
