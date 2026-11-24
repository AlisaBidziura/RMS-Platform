import { useState } from 'react'
import { Bot, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react'

export function LoginPage({
  onLogin
}) {
  const [name, setName] = useState('dispatcher');
  const [password, setPassword] = useState('demo123');
  return <div className="login-screen">
      <div className="login-decoration">
        <div className="login-orbit orbit-one" />
        <div className="login-orbit orbit-two" />
        <div className="login-art">
          <Bot size={88} />
          <span className="art-pulse" />
        </div>
        <div className="login-copy">
          <span className="eyebrow light">ROBOT MANAGEMENT SYSTEM</span>
          <h1>Управляйте роботами.<br /><em>Не усложняйте процессы.</em></h1>
          <p>Единое рабочее пространство для сервисных роботов, задач и инфраструктуры предприятия.</p>
          <div className="login-proof">
            <span><CheckCircle2 size={16} /> Единый мониторинг</span>
            <span><CheckCircle2 size={16} /> Контроль задач</span>
          </div>
        </div>
      </div>
      <div className="login-form-wrap">
        <div className="login-form">
          <div className="brand login-brand">
            <div className="brand-mark">
              <Bot size={22} />
            </div>
            <div>
              <b>rms<span>.</span></b>
              <small>ROBOT MANAGEMENT</small>
            </div>
          </div>
          <div className="form-heading">
            <h2>Добро пожаловать</h2>
            <p>Войдите в демонстрационный контур</p>
          </div>
          <form onSubmit={e => {
          e.preventDefault();
          if (name.trim() && password.trim()) onLogin(name.trim());
        }}>
            <label>Логин<input value={name} onChange={e => setName(e.target.value)} placeholder="Введите логин" required /></label>
            <label>Пароль<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" required /></label>
            <button className="primary-button full-width" type="submit">Войти в систему <ArrowUpRight size={17} /></button>
          </form>
          <div className="demo-note">
            <ShieldCheck size={16} />
            <span>Демо-режим: подойдут любые непустые логин и пароль.</span>
          </div>
          <p className="login-legal">Это прототип интерфейса. Настоящая авторизация не подключена.</p>
        </div>
      </div>
    </div>;
}
