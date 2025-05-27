'use server'
import { createClientForServer } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { redirect } from 'next/navigation';


const signInWith = (provider:Provider) => async (): Promise<{ success: string | null | boolean; error: string | Object ,email?:string}> => {
  const supabase = await createClientForServer()

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  })

  if (error) {
    // console.log(error)
    return { success: null, error: { message: 'OAuth sign-in failed' } };
  }

  if (data?.url) {
    redirect(data?.url)
  } else {
    return { success: null, error: { message: "No redirect URL found" } };
  }}

const signinWithGithub = signInWith('github')
const signinWithGoogle = signInWith('google')

const signOut = async () => {
  const supabase = await createClientForServer()
  await supabase.auth.signOut()
}

const signupWithEmailPassword = async (
  prev: any,
  formData: FormData
): Promise<{ success: string | null | boolean; error: string | null ,message?:string}> => {
  const supabase = await createClientForServer();

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { name: formData.get('name') as string }, // Store name in Supabase metadata
    },
  });

  if (error) {
    console.log('Signup error:', error.message);
    return {
      success: null,
      error: error.message,
    };
  }

  return {
    success:true,
    message: 'Please check your email to confirm your account.',
    error: null,
  };
};


const signinWithEmailPassword = async  (prev: any, formData: FormData): Promise<{ success: null; error: string | null }> => {
  const supabase = await createClientForServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    console.log('error', error);
    return {
      success: null,
      error: error.message, // Return error as a string
    };
  }
  console.log(error);
  

  return {
    success: null,
    error: null,
  };
};



export {
  signOut,
  signupWithEmailPassword,
  signinWithGithub,
  signinWithEmailPassword,
  signinWithGoogle
}