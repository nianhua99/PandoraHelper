import {SetStateAction, useEffect, useMemo, useState} from 'react';
import {Iconify} from "@/components/icon";
import shareService from "@/api/services/shareService.ts";
import sysService from "@/api/services/sysService.ts";
import {message} from "antd";

const LoginPage = () => {
  const [title, setTitle] = useState('Pandora');
  const [fuclaudeDomain, setFuclaudeDomain] = useState('https://demo.fuclaude.com');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isInputSubmitted, setIsInputSubmitted] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sysService.getLoginSetting().then((data) => {
      setTitle(data.pageTitle);
      if (data.fuclaudeDomain) {
        setFuclaudeDomain(data.fuclaudeDomain);
      }
    }).catch(_ => {
      message.error("获取标题失败")
    });
  }, []);

  const isSessionKey = useMemo(() => {
    return /^sk-ant-.*/.test(input.trim());
  }, [input]);

  const handleInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setInput(e.target.value);
  };

  const handlePasswordChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setPassword(e.target.value);
  };

  const handleNewPasswordChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setNewPassword(e.target.value);
  };

  const handleInputSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (isSessionKey) {
      window.location.href = `${fuclaudeDomain}/login_token?session_key=${input}`;
    }
    if (input) {
      setIsInputSubmitted(true);
    }
  };

  const handleEditInput = () => {
    setIsInputSubmitted(false);
    setIsChangePassword(false);
    setPassword('');
  };

  const handleLogin = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!input || !password) return;
    if (isChangePassword && !newPassword) return;
    if (isChangePassword) {
      setLoading(true)
      shareService.resetPassword(input, password, newPassword)
        .then((data) => {
          if (data) {
            message.success('Password changed successfully')
            setIsChangePassword(false)
            setPassword('')
          }
        }
        ).finally(() => {
          setLoading(false)
        });
    } else {
      setLoading(true)
      shareService.chatLoginShare(input, password)
        .then((data) => {
          if (data) {
            window.location.href = data
          }
        }).catch(_ => {
        setLoading(false)
      })
    }
  };

  const getButtonText = () => {
    if (loading) return <Iconify icon={'line-md:loading-loop'} />
    if (isInputSubmitted) return 'Log in';
    if (isSessionKey) return 'Continue with SessionKey';
    return 'Continue with UniqueName';
  };

  return (
    <div className="min-h-screen max-h-screen bg-page-bg">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-page-bg z-10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="text-orange-500 text-3xl mr-2 text-[#da7756]">✹</div>
            <div className="text-3xl font-serif">{title}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-12 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-6">
          <h1 className="font-light font-serif text-6xl" style={{
            fontFeatureSettings: "'ss01' on, 'liga' on",
            fontSmooth: 'antialiased',
            letterSpacing: 0,
            fontWeight: 100
          }}>
            Your ideas,<br/>
            amplified
          </h1>
          <p className="flex flex-col gap-[0.3em] sm:gap-[0.15em] items-center text-center text-text-100 font-normal text-pretty tracking-tight font-tiempos mt-4 break-words leading-[1em] text-base md:text-lg [&_span]:[backface-visibility:hidden] leading-snug font-serif">
            Privacy-first AI that helps you create in confidence.
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_0_#00000004,0_4px_32px_0_#00000004,0_2px_64px_0_#00000003,0_16px_32px_0_#00000003] p-6 w-full max-w-md bg-white border-1"
             style={{
               borderWidth: '0.5px',
               borderColor: 'rgba(112, 107, 87, 0.25)',
               fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
             }}>
          {/* Login Form */}
          <form onSubmit={isInputSubmitted ? handleLogin : handleInputSubmit}>
            {/* Email Input Group */}
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <Iconify icon={'material-symbols-light:mail-outline-rounded'} size={'1.35em'} />
              </div>
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Enter your uniqueName or sessionKey"
                className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                readOnly={isInputSubmitted}
              />
              {isInputSubmitted && (
                <button
                  type="button"
                  onClick={handleEditInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <Iconify icon={'mdi:circle-edit-outline'} size={'1.25em'} />
                </button>
              )}
            </div>

            {/* Password Input - Only shown after email is submitted */}
            <div className={`transform transition-all duration-300 ease-in-out overflow-hidden ${
              isInputSubmitted ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <Iconify icon={'mdi:lock-outline'} size={'1.25em'} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={!isChangePassword ? "Enter your password" : "Enter your original password"}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className={`transform transition-all duration-300 ease-in-out overflow-hidden ${
              isChangePassword ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <Iconify icon={'mdi:lock-outline'} size={'1.25em'}/>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="Enter your new password"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-button-primary text-gray-500 rounded-lg p-3 hover:opacity-90 transition-opacity font-bold"
              disabled={loading}
            >
              {getButtonText()}
            </button>
          </form>

          {/* Terms */}
          {!isInputSubmitted ? <div>
              <p className="mt-6 text-center text-text-400 text-xs text-gray-600">
                By continuing, you agree to LINUX DO's{' '}
                <a href="#" className="underline text-gray-600 no-blue"
                   style={{color: 'inherit', textDecoration: 'underline'}}>Consumer
                  Terms</a> and{' '}
                <a href="#" className="underline text-gray-600 no-blue"
                   style={{color: 'inherit', textDecoration: 'underline'}}>Usage
                  Policy</a>, and acknowledge their{' '}
              <a href="#" className="underline text-gray-600 no-blue"
                 style={{color: 'inherit', textDecoration: 'underline'}}>Privacy
                Policy</a>.
            </p>
          </div> :
            <div>
              <p className="mt-6 text-center text-text-400 text-xs text-gray-600">
                You can {' '}
                <button className="underline  text-gray-600 no-blue" onClick={() => setIsChangePassword(!isChangePassword)}
                   style={{color: 'inherit', textDecoration: 'underline'}}>change your password</button>{' '}
                at any time as long as you know your original password.
              </p>
            </div>
          }
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
