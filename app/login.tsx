import { auth } from '@/config/firebase';

import { useRouter } from 'expo-router';

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import { useEffect, useState } from 'react';

import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';


export default function LoginScreen() {

  const router = useRouter();

  const theme = useTheme();


  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);


  // Animation for mode toggle

  const [modeAnim] = useState(new Animated.Value(0));


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {

      if (user) {

        router.replace('/(tabs)');

      }

    });

    return unsubscribe;

  }, [router]);


  const toggleMode = () => {

    Animated.timing(modeAnim, {

      toValue: isLogin ? 1 : 0,

      duration: 300,

      useNativeDriver: false,

    }).start();

    setIsLogin(!isLogin);

    setError('');

  };


  const handleAuth = async () => {

    if (!email || !password) {

      setError('Por favor, rellena todos los campos');

      return;

    }


    setLoading(true);

    setError('');


    try {

      if (isLogin) {

        await signInWithEmailAndPassword(auth, email, password);

      } else {

        await createUserWithEmailAndPassword(auth, email, password);

      }

      router.replace('/(tabs)');

    } catch (err: any) {

      console.error(err);

      const errorCode = err?.code || '';


      if (isLogin) {

        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {

          setError('Correo o contraseña incorrectos');

        } else if (errorCode === 'auth/too-many-requests') {

          setError('Demasiados intentos. Intenta más tarde');

        } else {

          setError('Error al iniciar sesión. Intenta de nuevo');

        }

      } else {

        if (errorCode === 'auth/email-already-in-use') {

          setError('Este correo ya está registrado');

        } else if (errorCode === 'auth/weak-password') {

          setError('La contraseña debe tener al menos 6 caracteres');

        } else if (errorCode === 'auth/invalid-email') {

          setError('Correo electrónico no válido');

        } else if (errorCode === 'auth/operation-not-allowed') {

          setError('Este tipo de cuenta no está activado');

        } else {

          setError('Error al registrar. Verifica los datos');

        }

      }

    } finally {

      setLoading(false);

    }

  };


  const primaryColor = theme.colors.primary;

  const titleColor = modeAnim.interpolate({

    inputRange: [0, 1],

    outputRange: [primaryColor, '#10B981'], // verde para registro

  });


  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.logoIcon}>⚡</Text>
            </View>

            <Animated.Text style={[styles.title, { color: titleColor }]}>
              Flux
            </Animated.Text>
          </View>

          <Text variant="titleMedium" style={styles.subtitle}>
            Tu asistente nutricional
          </Text>
        </View>
        {/* Form Card */}
        <Surface style={styles.formCard} elevation={2}>
          {/* Mode Indicator */}
          <View style={styles.modeIndicator}>

            <View style={[styles.modeTab, isLogin && styles.modeTabActive]}>

              <Text

                style={[

                  styles.modeTabText,

                  isLogin && { color: theme.colors.primary, fontWeight: '700' },

                ]}

                onPress={() => !isLogin && toggleMode()}

              >

                Iniciar Sesión

              </Text>

            </View>

            <View style={[styles.modeTab, !isLogin && styles.modeTabActive]}>

              <Text

                style={[

                  styles.modeTabText,

                  !isLogin && { color: theme.colors.primary, fontWeight: '700' },

                ]}

                onPress={() => isLogin && toggleMode()}

              >

                Registrarse

              </Text>

            </View>

          </View>


          {/* Email Input */}

          <View style={styles.inputContainer}>

            <TextInput

              label="Correo electrónico"

              mode="outlined"

              value={email}

              onChangeText={(text) => {

                setEmail(text);

                setError('');

              }}

              autoCapitalize="none"

              keyboardType="email-address"

              textContentType="emailAddress"

              autoComplete="email"

              style={styles.input}

              outlineColor={theme.colors.outline}

              activeOutlineColor={theme.colors.primary}

            />

          </View>


          {/* Password Input */}

          <View style={styles.inputContainer}>

            <TextInput

              label="Contraseña"

              mode="outlined"

              value={password}

              onChangeText={(text) => {

                setPassword(text);

                setError('');

              }}

              secureTextEntry={!showPassword}

              textContentType={isLogin ? 'password' : 'newPassword'}

              autoComplete={isLogin ? 'password' : 'off'}

              style={styles.input}

              outlineColor={theme.colors.outline}

              activeOutlineColor={theme.colors.primary}

              right={

                <TextInput.Icon

                  icon={showPassword ? 'eye-off' : 'eye'}

                  onPress={() => setShowPassword(!showPassword)}

                  style={styles.eyeIcon}

                />

              }

            />

          </View>


          {/* Error Message */}

          {error ? (

            <View style={styles.errorContainer}>

              <Text style={styles.errorIcon}>⚠️</Text>

              <Text style={styles.errorText}>{error}</Text>

            </View>

          ) : null}


          {/* Submit Button */}

          <Button

            mode="contained"

            onPress={handleAuth}

            loading={loading}

            disabled={loading}

            contentStyle={styles.buttonContent}

            labelStyle={styles.buttonLabel}

            style={styles.button}

          >

            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}

          </Button>


          {/* Toggle Mode Link */}

          <View style={styles.toggleContainer}>

            <Text style={styles.toggleText}>

              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}

            </Text>

            <Pressable onPress={toggleMode}>

              <Text style={[styles.toggleLink, { color: theme.colors.primary }]}>

                {isLogin ? 'Regístrate' : 'Inicia sesión'}

              </Text>

            </Pressable>

          </View>

        </Surface>


        {/* Footer */}

        <View style={styles.footer}>

          <Text style={styles.footerText}>

            Al continuar, aceptas nuestros{' '}

            <Text style={styles.footerLink}>Términos</Text> y{' '}

            <Text style={styles.footerLink}>Política de Privacidad</Text>

          </Text>

        </View>

      </KeyboardAvoidingView>

    </Surface>

  );

}


const styles = StyleSheet.create({

  container: {

    flex: 1,

  },

  keyboardView: {

    flex: 1,

    justifyContent: 'center',

    padding: 24,

  },

  header: {

    alignItems: 'center',

    marginBottom: 32,

  },

  logoContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 8,

  },

  logoCircle: {

    width: 48,

    height: 48,

    borderRadius: 24,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 12,

  },

  logoIcon: {

    fontSize: 24,

  },

  title: {

    fontWeight: '900',

    letterSpacing: -1,

  },

  subtitle: {

    opacity: 0.7,

  },

  formCard: {

    padding: 24,

    borderRadius: 20,

  },

  modeIndicator: {

    flexDirection: 'row',

    marginBottom: 24,

    backgroundColor: 'rgba(0,0,0,0.05)',

    borderRadius: 12,

    padding: 4,

  },

  modeTab: {

    flex: 1,

    paddingVertical: 12,

    alignItems: 'center',

    borderRadius: 10,

  },

  modeTabActive: {

    backgroundColor: 'rgba(255,255,255,0.9)',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.1,

    shadowRadius: 2,

    elevation: 1,

  },

  modeTabText: {

    fontSize: 15,

    color: '#666',

  },

  inputContainer: {

    marginBottom: 16,

  },

  input: {

    backgroundColor: 'transparent',

  },

  eyeIcon: {

    marginRight: 8,

  },

  errorContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(239, 68, 68, 0.1)',

    padding: 12,

    borderRadius: 10,

    marginBottom: 16,

  },

  errorIcon: {

    marginRight: 8,

    fontSize: 16,

  },

  errorText: {

    fontSize: 14,

    fontWeight: '500',

  },

  button: {

    borderRadius: 14,

    marginTop: 8,

  },

  buttonContent: {

    paddingVertical: 8,

  },

  buttonLabel: {

    fontSize: 16,

    fontWeight: '700',

  },

  toggleContainer: {

    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: 20,

  },

  toggleText: {

    color: '#666',

    fontSize: 14,

  },

  toggleLink: {

    fontSize: 14,

    fontWeight: '600',

  },

  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },

  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});