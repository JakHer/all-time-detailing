import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type ConnectionState = 'checking' | 'ready' | 'misconfigured' | 'error';

export function SupabaseStatusCard() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isSupabaseConfigured ? 'checking' : 'misconfigured',
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    async function checkConnection() {
      const { error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setConnectionState('error');
        return;
      }

      setConnectionState('ready');
    }

    void checkConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = getContent(connectionState);

  return (
    <article className="rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(214,158,46,0.14),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
        Supabase
      </p>
      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
        Połączenie backendowe
      </h3>
      <p className="mt-3 text-sm leading-7 text-stone-300">
        {content.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-black/18 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Status
          </p>
          <p className="mt-2 text-sm font-medium text-stone-100">
            {content.label}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${content.tone}`}
        >
          {content.badge}
        </span>
      </div>
    </article>
  );
}

function getContent(connectionState: ConnectionState) {
  switch (connectionState) {
    case 'ready':
      return {
        label: 'Klient Supabase został poprawnie zainicjalizowany.',
        description:
          'Frontend jest już gotowy do pobierania i zapisywania danych. Następny krok to schema i przepięcie rezerwacji na prawdziwe tabele.',
        badge: 'Połączono',
        tone: 'border-emerald-300/20 bg-emerald-300/12 text-emerald-100',
      };
    case 'error':
      return {
        label:
          'Klient został skonfigurowany, ale odpowiedź z Supabase zwróciła błąd.',
        description:
          'Sprawdź klucz publishable i ustawienia projektu. Sam frontend jest już przygotowany pod integrację.',
        badge: 'Błąd',
        tone: 'border-rose-300/20 bg-rose-300/12 text-rose-100',
      };
    case 'misconfigured':
      return {
        label: 'Brakuje zmiennych środowiskowych dla Supabase.',
        description:
          'Uzupełnij .env, a aplikacja od razu przejdzie do kolejnego etapu integracji.',
        badge: 'Brak configu',
        tone: 'border-amber-300/20 bg-amber-300/12 text-amber-100',
      };
    default:
      return {
        label: 'Sprawdzam połączenie z projektem Supabase.',
        description:
          'Po starcie aplikacja wykonuje lekki check klienta, żeby potwierdzić gotowość backendu.',
        badge: 'Sprawdzanie',
        tone: 'border-sky-300/20 bg-sky-300/12 text-sky-100',
      };
  }
}
