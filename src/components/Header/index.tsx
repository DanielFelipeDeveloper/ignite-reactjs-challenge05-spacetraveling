import { useRouter } from 'next/router';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  const { asPath } = useRouter();

  return (
    <header
      className={`${styles.headerContainer} ${commonStyles.maxWidthContainer} ${
        asPath === '/' ? styles.homeHeader : ''
      }`}
    >
      <img src="/images/Logo.svg" alt="Logo" />
    </header>
  );
}
