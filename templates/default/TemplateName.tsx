import { FC } from 'react'
import styles from './TemplateName.module.css'

interface TemplateNameProps {}

const TemplateName: FC<TemplateNameProps> = () => {
  return <div className={styles.templateName} data-testid='TemplateName'></div>
}

export { TemplateName }
