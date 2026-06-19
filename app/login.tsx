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

    const authAction = mode === 'signIn' ? signIn : signUp;
    const result = await authAction(email.trim(), password);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signUp') {
      setMessage('Account created. If email confirmation is enabled, check your inbox before signing in.');
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
    borderColor: '#f1d69a',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff8e6',
    padding: 14,
    gap: 6,
  },
  form: {
    gap: 16,
  },
});
